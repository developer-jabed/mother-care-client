"use client";

import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/service/auth/loginUser";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

const LoginForm = ({ redirect }: { redirect?: string }) => {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form action={formAction} className="space-y-5">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">ইমেইল ঠিকানা</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 pl-10 transition-shadow focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </div>
          <InputFieldError field="email" state={state} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">পাসওয়ার্ড</FieldLabel>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="h-12 pl-10 pr-12 transition-shadow focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <InputFieldError field="password" state={state} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-base font-semibold text-white shadow-md shadow-fuchsia-600/25 transition-all hover:shadow-lg hover:shadow-fuchsia-600/40 hover:brightness-110 active:scale-[0.98]"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            প্রবেশ করা হচ্ছে...
          </span>
        ) : (
          "প্রবেশ করুন"
        )}
      </Button>

      <FieldDescription className="text-center text-sm text-gray-500">
        সহায়তা প্রয়োজন? প্রতিষ্ঠানের প্রশাসকের সাথে যোগাযোগ করুন।
      </FieldDescription>
    </form>
  );
};

export default LoginForm;