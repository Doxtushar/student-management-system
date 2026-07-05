export type StudentGender = 'Male' | 'Female' | 'Other';

export interface Student {
  id?: number;
  name: string;
  email: string;
  mobileNumber: string;
  course: string;
  address: string;
  gender: StudentGender;
  dateOfBirth: string;
}

export interface StudentPayload {
  name: string;
  email: string;
  mobileNumber: string;
  course: string;
  address: string;
  gender: StudentGender;
  dateOfBirth: string;
}