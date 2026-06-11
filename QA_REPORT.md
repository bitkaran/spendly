# QA Report - Spendly Expense Tracker

This document details the end-to-end Quality Assurance (QA) pass conducted on **Spendly** prior to staging it for final production deployment.

## Test Results Summary

* **Date of Testing**: June 11, 2026
* **Tester**: Antigravity AI
* **Status**: **ALL PASS** (20 / 20 Test Cases)

---

## QA Execution Log

| Test ID | Test Case | Status | Notes / Findings | Screenshots Needed |
| :--- | :--- | :---: | :--- | :---: |
| **TC-01** | Signup with OTP | **PASS** | Validated email regex and password length >= 6. OTP code generated and output in server logs. | Yes |
| **TC-02** | OTP Verification | **PASS** | Successfully verified unactivated user using 6-digit OTP code. Auto-seeded default categories. | Yes |
| **TC-03** | Login | **PASS** | Login succeeds with valid credentials. Unverified login attempts automatically trigger a fresh OTP email. | Yes |
| **TC-04** | Forgot Password | **PASS** | Requesting password recovery OTP for registered emails issues a recovery code and navigates to reset screen. | No |
| **TC-05** | Reset Password | **PASS** | Setting a new password (length >= 6) using the recovery OTP updates credentials correctly. | No |
| **TC-06** | Add Expense | **PASS** | Logged multiple expenses (e.g. ₹150 for Lunch, ₹500 for custom category). Segmented payment picker is highly tactile. | Yes |
| **TC-07** | Edit Expense | **PASS** | Tapping the edit icon opens the bottom sheet prefilled. Changes update the DB and recalculate totals. | Yes |
| **TC-08** | Delete Expense | **PASS** | Triggering delete opens the ConfirmModal overlay. Confirming deletes from DB. | Yes |
| **TC-09** | Create Custom Category | **PASS** | Custom category 'Team Outing' created. Correctly checks for duplicate labels (case-insensitive). | Yes |
| **TC-10** | Delete Custom Category | **PASS** | Custom category deleted successfully. Validation correctly blocks deleting default system categories. | Yes |
| **TC-11** | Dashboard Totals Update | **PASS** | Aggregated sums recalculate instantly upon inserting, modifying, or removing transactions. | Yes |
| **TC-12** | Statement Filters | **PASS** | Data rows in Statement grid filter correctly by date ranges, category tags, amounts, and modes. | Yes |
| **TC-13** | Statement Search | **PASS** | Keying in 'blue trove' filters the table to show matching remark/category items correctly. | Yes |
| **TC-14** | Excel Export Download | **PASS** | streams fully formatted spreadsheet files named `expense-statement-YYYY-MM.xlsx` with auto-filters. | No |
| **TC-15** | Analytics Charts Display | **PASS** | Doughnut, daily area trend, and comparison bar charts display exact ratios. Added ResizeObserver polyfill. | Yes |
| **TC-16** | Custom Calculator Results | **PASS** | Computes totals, entry counts, daily averages, peaks, and troughs correctly over date bounds. | Yes |
| **TC-17** | Profile Page Logout | **PASS** | Tapping 'Sign Out' clears credentials and token from localStorage and redirects to `/login`. | Yes |
| **TC-18** | Theme Toggling | **PASS** | Clicking the Sun/Moon icons appends the `dark` class to `document.documentElement` for slate values. | Yes |
| **TC-19** | Viewport Responsiveness | **PASS** | Adjusted container to `sm:h-[90vh] sm:max-h-[800px]` to prevent bottom navigation bar overlap. | Yes |
| **TC-20** | Console & API Integrity | **PASS** | No console warnings or unhandled exceptions logged. Axios interceptors successfully capture sessions. | No |

---

## Viewport Verification Checklist

The application viewport was resized to mobile widths to confirm that components scale without horizontal scrollbars, clipping, or overlapping items.

* **375px Width (iPhone X/12 Mini)**: **PASS**
  - Columns resize correctly. Text wrap handles metric cards. Bottom navigation stays fixed at base.
* **390px Width (iPhone 13/14 Pro)**: **PASS**
  - Spacing is clean. Cards are aligned. Touch targets are large and accessible.
* **430px Width (iPhone 14 Pro Max)**: **PASS**
  - Grid displays balance. Typography is responsive and readable.
