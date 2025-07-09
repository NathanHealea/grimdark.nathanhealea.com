import { FormState } from '@/types/form.types';


/**
 * UserProfilePicture type represents the structure of a user's profile picture.
 * It includes the URL of the profile picture and a File object for uploading a new picture.
 * The profilePictureFile can be null if no new picture is being uploaded.
 */
export type UserProfilePicture = {
  profilePictureUrl: string;
  profilePictureFile: File | null;
}


/**
 * UserProfilePictureFormState type represents the state of the user profile picture form.
 * It extends the FormState type with the UserProfilePicture type.
 * This state includes the user profile picture data, any errors that may occur, and a loading
 * indicator to show if the form is currently processing a request.
 */
export type UserProfilePictureFormState = FormState<UserProfilePicture>