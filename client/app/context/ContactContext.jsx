import React, { createContext, useContext } from "react";
import { useApiMutation } from "../hooks/useApiMutation.jsx";
import toast from "react-hot-toast";

const ContactsContext = createContext();

export const ContactsProvider = ({ children }) => {

  const sendZohoMessageMutation = useApiMutation({
    url: "/zoho/send",
    method: "post",
    onSuccessExtra: () => {
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Message not sent");
    },
  });


  return (
    <ContactsContext.Provider
      value={{
        sendZohoMessageMutation,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => useContext(ContactsContext);