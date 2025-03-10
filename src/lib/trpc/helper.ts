type BaseResponse = {
  status: number;
  message: string;
};

export const sendTRPCResponse = <T>(base: BaseResponse, data?: T) => {
  return {
    ...base,
    data: data || []
  };
};
