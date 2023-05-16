import { ZERO_ADDRESS } from "consts";
import { MetadataArgs } from "ton-vote-contracts-sdk";
import { DaoMetadataForm } from "types";
import { isZeroAddress, parseLanguage } from "utils";

interface Props extends MetadataArgs {
  dns?: string;
}

export const getInitialValues = (metadata?: Props) => {
  return {
    name: metadata?.name || "",
    telegram: metadata?.telegram || "",
    website: metadata?.website || "",
    github: metadata?.github || "",
    about: metadata?.about || "",
    terms: metadata?.terms || "",
    avatar: metadata?.avatar || "",
    hide: metadata?.hide || false,
    jetton: isZeroAddress(metadata?.jetton) ? "" : metadata?.jetton || "",
    nft: isZeroAddress(metadata?.nft) ? "" : "",
    dns: metadata?.dns || "",
    about_en: parseLanguage(metadata?.about) || "",
    name_en: parseLanguage(metadata?.name) || "",
  };
};

export const prepareMetadata = (form: DaoMetadataForm): DaoMetadataForm => {
  return {
    about: JSON.stringify({ en: form.about_en }),
    avatar: form.avatar || "",
    github: form.github || "",
    hide: form.hide,
    name: JSON.stringify({ en: form.name_en }),
    terms: "",
    telegram: form.telegram || "",
    website: form.website || "",
    jetton: form.jetton || ZERO_ADDRESS,
    nft: form.nft || ZERO_ADDRESS,
    dns: form.dns || "",
  };
};
