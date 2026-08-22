/** Cloudinary public PDF URLs are often blocked; view pages or proxy the file. */

export function isCloudinaryPdf(url: string) {
  return (
    url.includes("res.cloudinary.com") &&
    url.includes("/image/upload/") &&
    /\.pdf(\?|$)/i.test(url)
  );
}

export function cloudinaryPdfPageUrl(url: string, page: number) {
  return url.replace(
    "/image/upload/",
    `/image/upload/f_jpg,pg_${page}/`
  );
}

export function resumeViewHref(url: string) {
  if (!url) return "#";
  if (isCloudinaryPdf(url)) {
    return `/resume-view?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function resumeOriginalHref(url: string) {
  if (!url) return "#";
  if (isCloudinaryPdf(url)) {
    return `/api/utils/resume?url=${encodeURIComponent(url)}`;
  }
  return url;
}
