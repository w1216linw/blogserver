

// title: string;
// text: string;

import { PostInput } from "../resolvers/types";

export const validatePost = (input: PostInput) => {
  if(input.title === '') {
    return [
      {
        field: 'title',
        message: "title should not be empty"
      }
    ]
  }

  if(input.text === '') {
    return [
      {
        field: 'text',
        message: "body should not be empty"
      }
    ]
  }

  return null;
}