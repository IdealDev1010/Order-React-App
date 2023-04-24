import { useMutation } from "@tanstack/react-query";
import { Address } from "ton-core";
import { create } from "zustand";
import _ from "lodash";
import { useGetSender } from "hooks";
import * as TonVoteContract from "ton-vote-contracts-sdk";
import { getClientV2, MetadataArgs } from "ton-vote-contracts-sdk";
import { showPromiseToast } from "toasts";
import { useAppNavigation } from "router";
import { useNewDataStore, useTxReminderPopup } from "store";
import { ZERO_ADDRESS } from "consts";
import { persist } from "zustand/middleware";
import { Logger } from "utils";
import { useTranslation } from "react-i18next";

export interface DaoMetadata extends MetadataArgs {
  dns: string;
}

const initialCreateMetadataForm: DaoMetadata = {
  name: "",
  telegram: "",
  website: "",
  github: "",
  about: "",
  terms: "",
  avatar: "",
  hide: false,
  nft: "",
  jetton: "",
  dns: "",
};

export interface RolesForm {
  ownerAddress: string;
  proposalOwner: string;
}
interface State {
  step: number;
  setStep: (value: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  daoMetadataForm: DaoMetadata;
  rolesForm: RolesForm;
  metadataAddress?: string;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  setDaoMetadataForm: (value: DaoMetadata) => void;
  setMetadataAddress: (value: string) => void;
  setRolesForm: (rolesForm?: RolesForm) => void;
  reset: () => void;
}

export const useCreatDaoStore = create<State>((set) => ({
  editMode: false,
  rolesForm: {} as RolesForm,
  daoMetadataForm: initialCreateMetadataForm,
  step: 0,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  setEditMode: (editMode) => set({ editMode }),
  setDaoMetadataForm: (daoMetadataForm) => {
    set({ daoMetadataForm });
  },
  setMetadataAddress: (metadataAddress) => set({ metadataAddress }),
  setRolesForm: (rolesForm) => set({ rolesForm }),
  reset: () =>
    set({
      daoMetadataForm: {} as DaoMetadata,
      step: 0,
      rolesForm: {} as RolesForm,
    }),
}));

interface UseCompareDaoMetadataForm {
  form: DaoMetadata;
  setForm: (value: DaoMetadata) => void;
  formChanged: (value: DaoMetadata) => boolean;
}

export const useCompareDaoMetadataForm = create<UseCompareDaoMetadataForm>(
  (set, get) => ({
    form: {} as DaoMetadata,
    setForm: (form) => set({ form }),
    formChanged: (value) => {
      if (_.isEmpty(value)) return false;
      return !_.isEqual(value, get().form);
    },
  })
);

export const useCreateDaoMetadata = () => {
  const getSender = useGetSender();
  const { nextStep, setMetadataAddress, setDaoMetadataForm, editMode } =
    useCreatDaoStore();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const { t } = useTranslation();
  const { formChanged, setForm: setCompareForm } = useCompareDaoMetadataForm();

  return useMutation(
    async (values: DaoMetadata) => {
      const sender = getSender();

      const isFormChanged = formChanged(values);

      if (!isFormChanged) {
        nextStep();
        return;
      }
      const metadataArgs: DaoMetadata = {
        about: values.about,
        avatar: values.avatar || "",
        github: values.github,
        hide: values.hide,
        name: values.name,
        terms: values.terms,
        telegram: values.telegram,
        website: values.website,
        jetton: values.jetton || ZERO_ADDRESS,
        nft: values.nft || ZERO_ADDRESS,
        dns: values.dns,
      };
      Logger(metadataArgs);

      toggleTxReminder(true);
      const clientV2 = await getClientV2();
      const promise = TonVoteContract.newMetdata(
        sender,
        clientV2,
        metadataArgs
      );

      showPromiseToast({
        promise,
        success: editMode ? t("forumDetailsUpdated") : t("forumDetailsCreated"),
      });

      const address = await promise;
      if (typeof address === "string") {
        nextStep();
        setDaoMetadataForm(values);
        setMetadataAddress(address.toString());
        setCompareForm(values);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
      onSuccess: () => {
        window.scrollTo(0, 0);
      },
    }
  );
};

export const useCreateDao = () => {
  const getSender = useGetSender();
  const appNavigation = useAppNavigation();
  const { addDao } = useNewDataStore();
  const {
    rolesForm: { ownerAddress, proposalOwner },
    metadataAddress,
    reset,
  } = useCreatDaoStore();

  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async () => {
      const sender = getSender();
      const clientV2 = await getClientV2();
      const promise = TonVoteContract.newDao(
        sender,
        clientV2,
        metadataAddress!,
        ownerAddress,
        proposalOwner
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending",
        success: "Dao created!",
      });
      toggleTxReminder(true);
      const address = await promise;
      if (typeof address === "string") {
        appNavigation.daoPage.root(address);
        addDao(address);
        reset();
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
    }
  );
};
