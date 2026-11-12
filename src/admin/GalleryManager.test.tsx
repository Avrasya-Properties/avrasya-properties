import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { GalleryManager } from "./GalleryManager";
import type { GalleryResult, GalleryState } from "./gallery-items";

function Harness({ upload }: { upload: (f: File) => Promise<string> }) {
  const [v, setV] = useState<GalleryState>({});
  return (
    <>
      <GalleryManager
        value={v}
        upload={upload}
        onChange={(n: GalleryResult) => setV(n)}
        onOpenLibrary={() => {}}
      />
      <output data-testid="cover">{v.cover ?? "none"}</output>
    </>
  );
}

const img = (name: string) => new File(["x"], name, { type: "image/png" });

describe("GalleryManager", () => {
  it("accepts several dropped images and makes the first one the cover", async () => {
    const upload = vi.fn(async (f: File) => `/u/${f.name}`);
    render(<Harness upload={upload} />);
    fireEvent.drop(screen.getByTestId("gallery-dropzone"), {
      dataTransfer: { files: [img("a.png"), img("b.png"), img("c.png")] },
    });
    await waitFor(() => expect(screen.getAllByTestId("gallery-card")).toHaveLength(3));
    expect(upload).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId("cover").textContent).toBe("/u/a.png");
  });

  it("rejects non-image drops", async () => {
    const upload = vi.fn(async (f: File) => `/u/${f.name}`);
    render(<Harness upload={upload} />);
    fireEvent.drop(screen.getByTestId("gallery-dropzone"), {
      dataTransfer: { files: [new File(["x"], "doc.pdf", { type: "application/pdf" })] },
    });
    await Promise.resolve();
    expect(upload).not.toHaveBeenCalled();
  });

  it("edits category and caption, and changes the primary cover", async () => {
    const upload = vi.fn(async (f: File) => `/u/${f.name}`);
    render(<Harness upload={upload} />);
    fireEvent.drop(screen.getByTestId("gallery-dropzone"), {
      dataTransfer: { files: [img("a.png"), img("b.png")] },
    });
    await waitFor(() => expect(screen.getAllByTestId("gallery-card")).toHaveLength(2));
    fireEvent.change(screen.getByLabelText("Category for photo 2"), {
      target: { value: "Kitchen" },
    });
    expect((screen.getByLabelText("Category for photo 2") as HTMLSelectElement).value).toBe(
      "Kitchen",
    );
    fireEvent.change(screen.getByLabelText("Caption for photo 2"), {
      target: { value: "Open kitchen" },
    });
    expect((screen.getByLabelText("Caption for photo 2") as HTMLInputElement).value).toBe(
      "Open kitchen",
    );
    fireEvent.click(screen.getAllByText("Set as Primary Cover")[0]!);
    expect(screen.getByTestId("cover").textContent).toBe("/u/b.png");
  });
});
