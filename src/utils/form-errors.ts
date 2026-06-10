import { ApiClientError } from "@/api/client"

type FormWithSetError<TFieldName extends string> = {
  setError: (name: TFieldName, error: { message: string }) => void
}

export const applyApiFieldErrors = <TFieldName extends string>(
  error: unknown,
  form: FormWithSetError<TFieldName>,
  fields: readonly TFieldName[]
) => {
  if (!(error instanceof ApiClientError)) return

  for (const fieldError of error.fieldErrors ?? []) {
    if (fields.includes(fieldError.field as TFieldName)) {
      form.setError(fieldError.field as TFieldName, { message: fieldError.message })
    }
  }
}
