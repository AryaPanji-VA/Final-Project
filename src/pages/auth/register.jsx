import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { registerSchema } from "@/schemas/auth-schema";
import { register as registerUser } from "@/services/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function RegisterPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const password = useWatch({ control, name: "password" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";
  const passwordIsValid = password.length >= 8;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  async function onSubmit(values) {
    setServerError(null);

    try {
      const session = await registerUser(values);
      loginSuccess(session);
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(error.message ?? "Registration failed. Please try again.");
    }
  }

  return (
    <div>
      <p className="overline text-brass">New membership</p>

      <h1 className="mt-3 font-serif text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-[1.08] tracking-[-0.025em] text-ink">
        Create your account
      </h1>

      <p className="mt-3 text-[14px] leading-[1.65] text-ink-muted">
        Start with one world, or one story. Both are enough to begin.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="How you sign your work"
            invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="keeper@example.com"
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint={passwordIsValid ? "Long enough." : "At least 8 characters."}
          hintTone={passwordIsValid ? "success" : "faint"}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          hint={passwordsMatch ? "Passwords match." : undefined}
          hintTone="success"
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </Field>

        {serverError ? (
          <p
            role="alert"
            className="border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert"
          >
            {serverError}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-4">
        <p className="text-[13px] text-ink-muted">
          Already a member?{" "}
          <Link
            to="/login"
            className="text-arcane-bright underline-offset-4 transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
