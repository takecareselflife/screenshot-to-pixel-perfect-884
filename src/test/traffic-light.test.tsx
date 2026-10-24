import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TouchTrafficLight } from "@/components/TouchTrafficLight";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
afterEach(cleanup);

describe("colored body placements", () => {
  it("requires a circle and allows placing circles on every body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    fireEvent.click(screen.getByRole("button", { name: "Head and hair" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    const regions = ["head", "face", "shoulders", "arms", "chest", "abdomen", "private", "buttocks", "legs"];
    const labels = ["Head and hair", "Face", "Shoulders", "Arms and hands", "Chest", "Abdomen", "Private parts", "Buttocks", "Legs and feet"];
    regions.forEach((region, index) => {
      const color = ["green", "yellow", "red"][index % 3];
      const label = labels[index];
      if (!label || !color) throw new Error("Missing region or color");
      const circle = container.querySelector(`[data-color="${color}"]`);
      if (!circle) throw new Error("Missing color circle");
      fireEvent.click(circle);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(container.querySelector(`[data-placed-region="${region}"]`)?.getAttribute("data-placed-color")).toBe(color);
      // A completed answer cannot award points twice.
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByText(`${(index + 1) * 10} points`)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });
  });

  it("only accepts the situation color at its matching body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    for (const label of ["Head and hair", "Face", "Shoulders", "Arms and hands", "Chest", "Abdomen", "Private parts", "Buttocks", "Legs and feet"]) {
      fireEvent.click(screen.getByRole("button", { name: /^Green:/ }));
      fireEvent.click(screen.getByRole("button", { name: label }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    fireEvent.click(screen.getByRole("button", { name: /^Red:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Shoulders" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /^Green:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Face" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Shoulders" }));
    expect(container.querySelector('[data-placed-region="shoulders"]')?.getAttribute("data-placed-color")).toBe("green");
  });
});