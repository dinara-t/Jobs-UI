import styled from "styled-components";
import { Button } from "./Primitives";

const Wrap = styled.div`
  display: grid;
  gap: 12px;
  justify-items: center; /* centers everything horizontally */
`;

const Numbers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center; /* center page buttons */
`;

const NavRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center; /* center Prev/Next */
  width: 100%;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 72px;
  height: 72px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.bgElevated};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.bg : theme.colors.text};
  font-size: 1.05rem;
  font-weight: ${({ $active }) => ($active ? 800 : 500)};
  cursor: ${({ $active }) => ($active ? "default" : "pointer")};
  transition:
    background 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease,
    border-color 0.2s ease;

  &:disabled {
    opacity: 1;
    cursor: default;
  }
`;

const Ellipsis = styled.div`
  min-width: 28px;
  height: 72px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.05rem;
  font-weight: 700;
`;

type PaginationProps = {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  busy?: boolean;
  onPageChange: (page: number) => void;
};

function buildPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const current = currentPage + 1;

  if (current <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (current >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", current - 1, current, current + 1, "...", totalPages];
}

export function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  busy = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <Wrap>
      <Numbers>
        {pages.map((item, index) =>
          item === "..." ? (
            <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
          ) : (
            <PageButton
              key={item}
              type="button"
              $active={item === page + 1}
              disabled={busy || item === page + 1}
              onClick={() => onPageChange(item - 1)}
            >
              {item}
            </PageButton>
          ),
        )}
      </Numbers>

      <NavRow>
        {hasPrevious ? (
          <Button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={busy}
            style={{ minWidth: 140, justifyContent: "center" }}
          >
            ‹ Prev
          </Button>
        ) : null}

        {hasNext ? (
          <Button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={busy}
            style={{ minWidth: 140, justifyContent: "center" }}
          >
            Next ›
          </Button>
        ) : null}
      </NavRow>
    </Wrap>
  );
}