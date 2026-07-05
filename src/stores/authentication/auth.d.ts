export interface SignInRequestDto {
  username: string;
  password: string;
}

export interface SignInResponseDto {
  token: string;
  expiredAt: Date;
  userType: string;
}

export interface SignUpRequestDto {
  username: string;
  password: string;
  phoneNumber: string;
}
