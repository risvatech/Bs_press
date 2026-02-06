"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useApiMutation } from "../hooks/useApiMutation.jsx";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const RolesContext = createContext();

export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState({});

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const rolesForm = useForm({
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      isSystem: false,
      permissions: {},
      createdBy: 0,
    },
  });

  const getRolesMutation = useApiMutation({
    url: "/roles/get",
    method: "get",

    onSuccessExtra: (data) => {
      setRoles(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Fetch failed");
    },
  });

  useEffect(() => {
    getRolesMutation.mutate();
  }, []);

  const getRolesByIdMutation = useApiMutation({
    url: (roleId) => `/roles/get/${roleId}`,
    method: "get",

    onSuccessExtra: (data) => {
      setRole(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Fetch failed");
    },
  });

  const createRolesMutation = useApiMutation({
    url: "/roles/create",
    method: "post",
    successMsg: "Added Roles successfully",
    onSuccessExtra: (data) => {
      toast.success("Added Roles successfully");
      getRolesMutation.mutate();
      rolesForm.reset({
        name: "",
        displayName: "",
        description: "",
        isSystem: false,
        permissions: {},
        createdBy: 0,
      });
      setIsRoleDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Add failed");
    },
  });

  const deleteRolesMutation = useApiMutation({
    url: (roleId) => `/roles/delete/${roleId}`,
    method: "delete",
    successMsg: "Roles deleted successfully",
    onSuccessExtra: (data) => {
      toast.success("Roles deleted successfully");
      getRolesMutation.mutate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });

  const updateRolesMutation = useApiMutation({
    url: (roleId) => `/roles/update/${roleId}`,
    method: "put",
    successMsg: "Roles updated successfully",
    onSuccessExtra: (data) => {
      toast.success("Roles updated successfully");
      setEditingRole(null);
      rolesForm.reset({
        name: "",
        displayName: "",
        description: "",
        isSystem: false,
        permissions: {},
        createdBy: 0,
      });
      setIsRoleDialogOpen(false);
      getRolesMutation.mutate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  return (
    <RolesContext.Provider
      value={{
        roles,
        setRoles,
        getRolesMutation,
        createRolesMutation,
        rolesForm,
        deleteRolesMutation,
        updateRolesMutation,
        role,
        setRole,
        getRolesByIdMutation,
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        editingRole,
        setEditingRole,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => useContext(RolesContext);
