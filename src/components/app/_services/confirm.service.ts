import type { CallApi } from "../_context/call.context";
import type { ConfirmDialogOptions } from "../ConfirmDialog";

let dialog: AppConfirmDialog | undefined;

function getDialog(): AppConfirmDialog {
  if (!dialog) {
    dialog = document.createElement("app-confirm-dialog");
    const host = document.querySelector("theme-provider") ?? document.body;
    host.appendChild(dialog);
  }
  return dialog;
}

/** Resolve the live call API — context on distant hosts can lag or be missing. */
export function getActiveCallApi(call?: CallApi): CallApi | undefined {
  if (call?.active) return call;

  const provider = document.querySelector("call-provider");
  const live = (provider as { call?: CallApi } | null)?.call;
  return live?.active ? live : undefined;
}

export function confirmAction(options: ConfirmDialogOptions): Promise<boolean> {
  return getDialog().ask(options);
}

export async function confirmLeaveCall(action: "leave" | "logout"): Promise<boolean> {
  const isLogout = action === "logout";
  return confirmAction({
    title: isLogout ? "Log out during call?" : "Leave meeting?",
    message: isLogout
      ? "You are in an active call. Logging out will end your call and disconnect you from the room."
      : "Are you sure you want to leave this meeting? You will be disconnected from the room.",
    confirmLabel: isLogout ? "Log out" : "Leave meeting",
    cancelLabel: "Stay",
    confirmColor: "error",
  });
}

/** If a call is active, confirm first; on approval runs `leave()` then `onProceed`. */
export async function leaveCallIfConfirmed(
  call: CallApi | undefined,
  action: "leave" | "logout",
  onProceed: () => void,
): Promise<void> {
  const liveCall = getActiveCallApi(call);
  if (!liveCall?.active) {
    onProceed();
    return;
  }

  if (!(await confirmLeaveCall(action))) return;

  liveCall.leave();
  onProceed();
}
