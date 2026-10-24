import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TouchTrafficLight } from "@/components/TouchTrafficLight";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
afterEach(cleanup);

const regions = ["head", "face", "shoulders", "arms", "chest", "abdomen", "private", "buttocks", "upperBack", "lowerBack", "thighs", "legs", "feet"];
const labels = ["Head and hair", "Face", "Shoulders", "Arms and hands", "Chest", "Abdomen", "Genitals (private parts)", "Buttocks", "Upper back", "Lower back", "Thighs", "Lower legs", "Feet"];
// Red: genitals, chest and buttocks. Yellow: face, abdomen, lower back and thighs. Green: everything else.
const colors = ["green", "yellow", "green", "green", "red", "yellow", "red", "red", "green", "yellow", "yellow", "green", "green"];

function pick(container: HTMLElement, color: string) {
  const circle = container.querySelector(`[data-color="${color}"]`);
  if (!circle) throw new Error("Missing color circle");
  fireEvent.click(circle);
}

function place(container: HTMLElement, index: number) {
  const label = labels[index];
  if (!label) throw new Error("Missing body label");
  pick(container, colors[index] ?? "green");
  fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
}

function coverAll(container: HTMLElement) {
  regions.forEach((_, index) => place(container, index));
}

describe("colored body placements", () => {
  it("requires picking a circle before choosing a body part", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    fireEvent.click(screen.getByRole("button", { name: "Head and hair", hidden: true }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    expect(screen.getByText("First pick a circle: green, yellow or red.")).toBeInTheDocument();
  });

  it("lets the player cover every body region with its matching color", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    regions.forEach((region, index) => {
      if (index < regions.length - 1) {
        place(container, index);
        expect(container.querySelector(`[data-placed-region="${region}"]`)?.getAttribute("data-placed-color")).toBe(colors[index]);
      }
    });
    expect(screen.getByText("12 of 13 body parts")).toBeInTheDocument();
  });

  it.each(labels.map((label, i) => [label, regions[i], colors[i]] as const))(
    "%s accepts only the %s circle",
    (label, region, color) => {
      const { container } = render(<TouchTrafficLight />);
      fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
      for (const wrong of ["green", "yellow", "red"]) {
        if (wrong === color) continue;
        pick(container, wrong);
        fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
        expect(container.querySelector(`[data-placed-region="${region}"]`)).toBeNull();
      }
      pick(container, color ?? "green");
      fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
      expect(container.querySelector(`[data-placed-region="${region}"]`)?.getAttribute("data-placed-color")).toBe(color);
    },
  );

  it("does not place a second circle on an already covered body part", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    place(container, 0); // head, green
    pick(container, "red");
    fireEvent.click(screen.getByRole("button", { name: "Head and hair", hidden: true }));
    expect(container.querySelectorAll('[data-placed-region="head"]')).toHaveLength(1);
    expect(container.querySelector('[data-placed-region="head"]')?.getAttribute("data-placed-color")).toBe("green");
    expect(screen.getByText("This body part already has its color. Choose another one!")).toBeInTheDocument();
  });

  it("shows the trophy screen with the trusted-adult guidance once every region is covered", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    coverAll(container);
    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    expect(screen.getByText(/talk to a trusted adult or a health professional/)).toBeInTheDocument();
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
  });

  it("restart clears every placement and returns to the intro", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    place(container, 0);
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Start the game" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
  });
});
