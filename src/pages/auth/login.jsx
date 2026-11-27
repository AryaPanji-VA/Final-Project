import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { loginSchema } from "@/schemas/auth-schema";
import { login } from "@/services/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

/**
 * LoginPage — set like a title page: overline, serif statement, standfirst,
 * hairline, then the form. The split screen in AuthLayout supplies the frame,
 * so the form needs no card of its own.
 */
export function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values) {
    setServerError(null);

    try {
      const session = await login(values);
      loginSuccess(session);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (error) {
      setServerError(error.message ?? "Sign-in failed. Please try again.");
    }
  }

  return (
    <div>
      <p className="overline text-brass">Members&rsquo; entrance</p>

      <h1 className="type-ui-title mt-3 text-[clamp(1.6rem,1.35rem+1vw,2rem)] text-ink">
        Sign in
      </h1>

      <p className="mt-3 text-[14px] leading-[1.65] text-ink-muted">
        Pick up the story you were writing, or the one you were reading.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            invalid={Boolean(errors.password)}
            {...register("password")}
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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-4">
        <p className="text-[13px] text-ink-muted">
          No account yet?{" "}
          <Link
            to="/register"
            className="text-arcane-bright underline-offset-4 transition-colors hover:underline"
          >
            Create one
          </Link>
        </p>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">
          This build runs without a server: any valid email and an eight-character password will
          open a session.
        </p>
      </div>
    </div>
  );
}
