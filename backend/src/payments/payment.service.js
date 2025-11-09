const PAYFAST_BASE_URL = "https://sandbox.payfast.co.za/fake";

const normaliseAmount = (amountCents) => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return 0;
  }
  return Math.floor(amountCents);
};

export const createCheckout = (jobId, amountCents) => {
  const searchParams = new URLSearchParams({ id: jobId });
  const sanitisedAmount = normaliseAmount(amountCents);

  if (sanitisedAmount > 0) {
    searchParams.set("amount", sanitisedAmount.toString());
    searchParams.set("currency", "ZAR");
  }

  return {
    checkoutUrl: `${PAYFAST_BASE_URL}?${searchParams.toString()}`,
  };
};
