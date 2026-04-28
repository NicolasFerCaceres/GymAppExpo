/*This validate that the text its only text, used in the repos */
export function val_text_only(to_eval: string, label = "El campo"): void {
  const str = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\/\s]+$/;

  if (!str.test(to_eval.trim())) {
    throw new Error(`${label} solo puede contener letras y espacios.`);
  }
}
