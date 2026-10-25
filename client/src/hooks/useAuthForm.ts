import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Router from "next/router";
import type { z } from "zod";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/store/authStore";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { parse } from "path";

type Values = Record<string, string>;
type FieldErrors<T extends Values> = Partial<Record<keyof T, string>>;

interface AuthForm<T extends Values> {
  values: T;
  fieldErrors: FieldErrors<T>;
  formError: string | null;
  submitting: boolean;
  bind: (field: keyof T) => { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void };
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

function toFieldErrors<T extends Values>(error: z.ZodError): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T;
    errors[field] ??= issue.message;
  }
  return errors;
}

// shared by /login and /register: validate, POST, store the user; the effect below redirects
export function useAuthForm<T extends Values>(schema: z.ZodType<unknown, T>, endpoint: string, initial: T): AuthForm<T> {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const setUser = useAuth((s) => s.setUser);
  const [values, setValues] = useState<T>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && user) void Router.replace(ROUTES.dashboard);
  }, [hydrated, user]);

  const bind = (field: keyof T) => ({
    value: values[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValues((prev) => ({ ...prev, [field]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors<T>(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try{
      const data = await api.post(endpoint, parsed.data)
      setUser(data?.data.data.user)
    } catch(e: unknown) {
      const message = isAxiosError(e) ? e.response?.data?.message : undefined
      setFormError(message ?? "Unable to call /login")
    } finally {
      setSubmitting(false)
    }
  }

  return { values, fieldErrors, formError, submitting, bind, handleSubmit };
}
