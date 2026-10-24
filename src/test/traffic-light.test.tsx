import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TouchTrafficLight } from "@/components/TouchTrafficLight";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
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
    const label = labels[index];
    if (!label) throw new Error("Missing body label");
    fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
  });
}

describe("colored body placements", () => {
  it("returns focus to the activity after advancing from a completed placement", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    pick(container, "green");
    fireEvent.click(screen.getByRole("button", { name: "Head and hair", hidden: true }));
    const next = screen.getByRole("button", { name: "Next" });
    next.focus();
    expect(document.activeElement).toBe(next);
    fireEvent.click(next);
    expect(document.activeElement).toBe(container.querySelector('[tabindex="-1"]'));
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("requires a circle and allows placing circles on every body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    fireEvent.click(screen.getByRole("button", { name: "Head and hair", hidden: true }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    regions.forEach((region, index) => {
      const color = privateRegions.includes(region) ? "red" : index % 2 === 0 ? "green" : "yellow";
      const label = labels[index];
      if (!label) throw new Error("Missing body label");
      pick(container, color);
      fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
      expect(container.querySelector(`[data-placed-region="${region}"]`)?.getAttribute("data-placed-color")).toBe(color);
      // A completed answer cannot award points twice.
      fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
      expect(screen.getByText(`${(index + 1) * 10} points`)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });
  });

  it.each(["Chest", "Private parts", "Buttocks"])("%s accepts the red circle and not green or yellow", (label) => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    const target = regions[labels.indexOf(label)];
    if (!target) throw new Error("Missing target");
    // advance to the target step
    for (let i = 0; i < labels.indexOf(label); i++) {
      const region = regions[i];
      const currentLabel = labels[i];
      if (!region || !currentLabel) throw new Error("Missing region");
      pick(container, privateRegions.includes(region) ? "red" : "green");
      fireEvent.click(screen.getByRole("button", { name: currentLabel, hidden: true }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    for (const wrong of ["green", "yellow"]) {
      pick(container, wrong);
      fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
      expect(container.querySelector(`[data-placed-region="${target}"]`)).toBeNull();
    }
    pick(container, "red");
    fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
    expect(container.querySelector(`[data-placed-region="${target}"]`)?.getAttribute("data-placed-color")).toBe("red");
  });

  it("only accepts the situation color at its matching body region", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    finishLevel1(container);
    pick(container, "red");
    fireEvent.click(screen.getByRole("button", { name: "Shoulders", hidden: true }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    pick(container, "green");
    fireEvent.click(screen.getByRole("button", { name: "Face", hidden: true }));
    expect(container.querySelectorAll("[data-placed-region]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Shoulders", hidden: true }));
    expect(container.querySelector('[data-placed-region="shoulders"]')?.getAttribute("data-placed-color")).toBe("green");
  });

  it("awards the trusted-adult activity only once", () => {
    const { container } = render(<TouchTrafficLight />);
    fireEvent.click(screen.getByRole("button", { name: "Start the game" }));
    finishLevel1(container);
    const situations = [["green", "Shoulders"], ["green", "Arms and hands"], ["yellow", "Abdomen"], ["yellow", "Shoulders"], ["red", "Private parts"], ["red", "Chest"]] as const;
    for (const [color, label] of situations) {
      pick(container, color);
      fireEvent.click(screen.getByRole("button", { name: label, hidden: true }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    for (const name of ["Say no and choose another greeting.", "Tell a trusted adult.", "The professional should explain the examination, respect your privacy, and follow appropriate safeguards."]) {
      fireEvent.click(screen.getByRole("button", { name }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    for (const name of ["A parent or family member you trust", "A teacher or school counselor", "A doctor or nurse", "A coach or club leader"]) fireEvent.click(screen.getByRole("button", { name }));
    const check = screen.getByRole("button", { name: "Check my choices" });
    fireEvent.click(check);
    expect(screen.getByText("190 points")).toBeInTheDocument();
    fireEvent.click(check);
    expect(screen.getByText("190 points")).toBeInTheDocument();
  });
});
