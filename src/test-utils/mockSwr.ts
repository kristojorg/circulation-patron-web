import useSWR, { responseInterface } from "swr";

jest.mock("swr");

export const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

export function makeSwrResponse<T>(value?: Partial<responseInterface<T, any>>) {
  return {
    data: undefined,
    error: undefined,
    revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}
const defaultMock = makeSwrResponse();

export const mockSwr: MockSwr<any> = (value = defaultMock) => {
  mockedSWR.mockReturnValue(makeSwrResponse(value));
};

export type MockSwr<T> = (value?: Partial<responseInterface<T, any>>) => void;
