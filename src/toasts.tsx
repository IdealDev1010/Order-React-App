import { IconButton, styled } from "@mui/material";
import { useParseError } from "hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import toast, { ToastPosition } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { StyledFlexRow } from "styles";
import { SlWallet } from "react-icons/sl";
import { TON_CONNECTOR } from "config";
export function usePromiseToast<T>() {
  const parseError = useParseError();
  const translations = useCommonTranslations();
  return (args: {
    promise: Promise<T>;
    loading?: string;
    success?: string;
    error?: string;
    isSuccess?: (value: any) => boolean;
  }) => {
    let infoToast = "";
    if (TON_CONNECTOR.wallet?.provider !== 'injected') {
      infoToast = showToast(translations.checkWalletForTx);
    }
    toast.promise(
      args.promise,
      {
        loading: args.loading || translations.txPending,
        success: (value) => {
          infoToast && toast.dismiss(infoToast);
          const show = args.isSuccess ? args.isSuccess(value) : true;
          if (show && args.success && value) {
            return (
              <ToastContent
                message={args.success}
                customClick={toast.dismiss}
              />
            );
          }
          return null;
        },
        error: (err: any) => {          
          infoToast && toast.dismiss(infoToast);
          const parsedError = parseError(
            err instanceof Error ? err.message : err
          );

          return (
            <ToastContent customClick={toast.dismiss} message={parsedError} />
          );
        },
      },
      {
        success: {
          duration: 5000,
        },
        error: {
          duration: 5000,
        },
        position: "top-center",
      }
    );
  };
}


export const showErrorToast = (message: string) => {
  toast.dismiss();

  toast.error((t) => <ToastContent message={message} id={t.id} />, {
    duration: 500000,
  });
};

export const showSuccessToast = (message: string) => {
  toast.success((t) => <ToastContent message={message} id={t.id} />, {
    duration: 5000,
  });
};

interface ToastConfig {
  duration?: number;
  position: ToastPosition;
}

export const showToast = (message: string, config?: ToastConfig) => {
  return toast((t) => <ToastContent message={message} id={t.id} />, {
    duration: config?.duration || Infinity,
    position: config?.position || "top-center",
    icon: <SlWallet />,
    className: 'info-toast',
  
  });
};

const ToastContent = ({
  message,
  id,
  customClick,
}: {
  message: string;
  id?: string;
  customClick?: () => void;
}) => {
  const showButton = customClick || id;
  return (
    <StyledPromiseContainer>
      {message}
      {showButton && (
        <StyledIconButton
          onClick={() => (customClick ? customClick() : toast.dismiss(id))}
        >
          <IoMdClose style={{ width: 20, height: 20, cursor: "pointer" }} />
        </StyledIconButton>
      )}
    </StyledPromiseContainer>
  );
};

const StyledIconButton = styled(IconButton)({
  padding: 5,
});

const StyledPromiseContainer = styled(StyledFlexRow)({});