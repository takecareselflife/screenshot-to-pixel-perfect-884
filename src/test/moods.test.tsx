import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BemEstar } from "@/routes/bem-estar";

vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
vi.mock("@/components/Layout", () => ({ PageTitle: ({ title }: { title: string }) => <h1>{title}</h1>, SimBadge: () => null }));
afterEach(cleanup);

it.each([
  ["happy", "Mood"], ["okay", "Mood"], ["sad", "Mood"],
  ["anxious", "Anxiety and stress"], ["tired", "Sleep"], ["lonely", "Relationships and safety"],
])("%s opens the reflection questions without preselecting answers", (mood, title) => {
  render(<BemEstar />);
  fireEvent.click(screen.getByRole("button", { name: `I feel ${mood}` }));
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getAllByRole("group")).toHaveLength(3);
  expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
});