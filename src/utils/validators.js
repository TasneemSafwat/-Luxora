import { z } from 'zod';
import { digitsOnly, isExpiryInFuture, isExpiryPlausible, luhnCheck, parseExpiry } from './card';

/** Shared Zod schemas — a single source of truth for every form's validation. */

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const phoneSchema = z
  .string()
  .min(7, 'Enter a valid phone number')
  .regex(/^[+()\-\s\d]{7,20}$/, 'Only digits, spaces and + ( ) - allowed');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Enter your first name'),
    lastName: z.string().min(2, 'Enter your last name'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Enter your first name'),
  lastName: z.string().min(2, 'Enter your last name'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
});

export const addressSchema = z.object({
  label: z.string().min(2, 'Add a label, e.g. Home'),
  fullName: z.string().min(3, 'Enter the recipient name'),
  phone: phoneSchema,
  line1: z.string().min(5, 'Enter the street address'),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'Enter the city'),
  state: z.string().min(2, 'Enter the state / region'),
  postalCode: z
    .string()
    .min(3, 'Enter a valid postal code')
    .max(12, 'Postal code is too long'),
  country: z.string().min(2, 'Select a country'),
  isDefault: z.boolean().optional().default(false),
});

export const checkoutSchema = z
  .object({
    email: emailSchema,
    firstName: z.string().min(2, 'Enter your first name'),
    lastName: z.string().min(2, 'Enter your last name'),
    phone: phoneSchema,
    address1: z.string().min(5, 'Enter the street address'),
    address2: z.string().optional().or(z.literal('')),
    city: z.string().min(2, 'Enter the city'),
    state: z.string().min(2, 'Enter the state / region'),
    postalCode: z.string().min(3, 'Enter a valid postal code').max(12, 'Postal code is too long'),
    country: z.string().min(2, 'Select a country'),
    shippingMethod: z.string().min(1, 'Choose a delivery method'),
    paymentMethod: z.string().min(1, 'Choose a payment method'),
    notes: z.string().max(280, 'Keep notes under 280 characters').optional().or(z.literal('')),
    cardName: z.string().optional().or(z.literal('')),
    cardNumber: z.string().optional().or(z.literal('')),
    cardExpiry: z.string().optional().or(z.literal('')),
    cardCvc: z.string().optional().or(z.literal('')),
  })
  // Card fields are only mandatory when the shopper actually pays by card.
  // (Before this, "Credit / Debit Card" could be submitted completely empty.)
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== 'card') return;

    const fail = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (!data.cardName || data.cardName.trim().length < 2) fail('cardName', 'Enter the name on the card');

    if (!data.cardNumber || digitsOnly(data.cardNumber).length < 12) fail('cardNumber', 'Enter your card number');
    else if (!luhnCheck(data.cardNumber)) fail('cardNumber', 'That card number does not look right');

    if (!data.cardExpiry || !parseExpiry(data.cardExpiry)) fail('cardExpiry', 'Use the format MM/YY');
    else if (!isExpiryInFuture(data.cardExpiry)) fail('cardExpiry', 'This card has expired');
    else if (!isExpiryPlausible(data.cardExpiry)) fail('cardExpiry', 'Check the expiry year');

    if (!/^\d{3,4}$/.test(digitsOnly(data.cardCvc ?? ''))) fail('cardCvc', 'Enter the 3 or 4 digit code');
  });

/** Score a password 0–4 for the strength meter. */
export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const normalized = Math.min(score, 4);
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  return { score: normalized, label: labels[normalized] };
}
