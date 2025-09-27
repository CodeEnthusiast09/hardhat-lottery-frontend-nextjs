"use client";

import { useNotifications } from "@web3-onboard/react";
import { useEffect } from "react";

export default function AboutPage() {
  const [
    notifications, // the list of all notifications that update when notifications are added, updated or removed
    customNotification, // a function that takes a customNotification object and allows custom notifications to be shown to the user, returns an update and dismiss callback
    updateNotify, // a function that takes a Notify object to allow updating of the properties
  ] = useNotifications();

  // View notifications as they come in if you would like to handle them independent of the notification display
  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  return (
    <div className="h-full w-full flex items-center justify-center m-auto">
      <button
        className="bn-demo-button bg-amber-500 p-5 rounded-xl"
        onClick={() => {
          const { update } = customNotification({
            eventCode: "dbUpdate",
            type: "hint",
            message: "Custom hint notification created by the dapp",
            onClick: () => window.open(`https://www.blocknative.com`),
          });
          // Update your notification example below
          setTimeout(
            () =>
              update({
                eventCode: "dbUpdateSuccess",
                message: "Hint notification reason resolved!",
                type: "success",
                autoDismiss: 5000,
              }),
            4000
          );
        }}
      >
        Custom Hint Notification
      </button>
    </div>
  );
}
