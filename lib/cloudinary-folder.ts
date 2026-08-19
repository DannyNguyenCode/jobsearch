/**
 * Cloudinary folder for an application:
 * jobtrackerhub/{person-name}/{jobtitle-dd-mm-yyyy}
 * Example: jobtrackerhub/alex-johnson/customerservice-18-08-2026
 */
function slugPerson(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

function slugJobTitle(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") || "role";
}

function folderDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function cloudinaryApplicationFolder(
  personName: string,
  jobTitle: string,
  appliedAt: Date = new Date(),
) {
  const root = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "jobtrackerhub";
  return `${root}/${slugPerson(personName)}/${slugJobTitle(jobTitle)}-${folderDate(appliedAt)}`;
}
