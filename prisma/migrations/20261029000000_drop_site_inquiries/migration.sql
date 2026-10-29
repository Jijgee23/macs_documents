-- macs.mn now stores its own quote requests and contact messages (copied over with
-- macs.mn's `npm run db:import-docs-inquiries` before this runs).
DROP TABLE "QuoteRequest";
DROP TABLE "ContactMessage";
DROP TYPE "RequestStatus";
