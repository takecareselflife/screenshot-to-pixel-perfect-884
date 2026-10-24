import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TouchTrafficLight } from "@/components/TouchTrafficLight";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
afterEach(cleanup);

const regions = ["head", "face", "shoulders", "arms", "chest", "abdomen", "private", "buttocks", "legs"];
const labels = ["Head and hair", "Face", "Shoulders", "Arms and hands", "Chest", "Abdomen", "Private parts", "Buttocks", "Legs and feet"];
const privateRegions = ["chest", "private", "buttocks"];

function pick(container: HTMLElement, color: string) {
  const circle = container.querySelector(`[data-color="${color}"]`);
  if (!circle) throw new Error("Missing color circle");
  fireEvent.click(circle);
}

function finishLevel1(container: HTMLElement) {
  regions.forEach((region, index) => {
    pick(container, privateRegions.includes(region) ? "red" : "green");
    fireEvent.click(screen.getByRole("button", { name: labels[index] }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
  });
}

describe("colored body placements", () => {
  it("requires a circle and allows placing circles on every body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    fireEvent.click(screen.getByRole("button", { name: "Head and hair" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    regions.forEach((region, index) => {
      const color = privateRegions.includes(region) ? "red" : ["green", "yellow"][index % 2]!;
      const label = labels[index]!;
      pick(container, color);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(container.querySelector(`[data-placed-region="${region}"]`)?.getAttribute("data-placed-color")).toBe(color);
      // A completed answer cannot award points twice.
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByText(`${(index + 1) * 10} points`)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });
  });

  it.each(["Chest", "Private parts", "Buttocks"])("%s accepts the red circle and not green or yellow", (label) => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    const target = regions[labels.indexOf(label)]!;
    // advance to the target step
    for (let i = 0; i < labels.indexOf(label); i++) {
      pick(container, privateRegions.includes(regions[i]!) ? "red" : "green");
      fireEvent.click(screen.getByRole("button", { name: labels[i] }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    for (const wrong of ["green", "yellow"]) {
      pick(container, wrong);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(container.querySelector(`[data-placed-region="${target}"]`)).toBeNull();
    }
    pick(container, "red");
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(container.querySelector(`[data-placed-region="${target}"]`)?.getAttribute("data-placed-color")).toBe("red");
  });

  it("only accepts the situation color at its matching body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    finishLevel1(container);
    pick(container, "red");
    fireEvent.click(screen.getByRole("button", { name: "Shoulders" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    pick(container, "green");
    fireEvent.click(screen.getByRole("button", { name: "Face" }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Shoulders" }));
    expect(container.querySelector('[data-placed-region="shoulders"]')?.getAttribute("data-placed-color")).toBe("green");
  });
});
