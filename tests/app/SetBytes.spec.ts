import { SetBytes } from "@/index";

describe("SetBytes", () => {
  it("should return \"Hello\" when hello() is called", () => {
    const setBytesInstance = new SetBytes();
    const result = setBytesInstance.hello();
    expect(result).toBe("Hello");
  });
});
