

/**
 * Validates the profile picture file.
 * @param file - The file to validate
 * @returns A validation error message if the file is invalid, or null if it is valid.
 */
export function validateProfilePictureFile(file: File | null): string | null {
  if (!file) {
    return 'No file selected';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, and GIF are allowed.';
  }

  // if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //   console.warn(`File size: ${file.size / (1024 * 1024)}MB`);
  //   return 'File size exceeds the limit of 5MB.';
  // }

  return null;
}


export function validateUserId(userId: number | null): string | null {
  if (!userId) {
    return 'User ID is required';
  }

  if (typeof userId !== 'number') {
    return 'Invalid User ID format';
  }

  if (userId <= 0) {
    return 'User ID is not valid';
  }

  return null;
}