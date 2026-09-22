// Vercel Blob is used to store Dusty's uploaded screenshots and photos.
// Guarded on the token so the app runs before Blob is connected.
export const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
