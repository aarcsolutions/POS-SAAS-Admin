import type { Category } from '@/types/category.types';

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export type TreeRow = Category & {
  children: TreeRow[];
  depth: number;
};

export type VisibleTreeRow = TreeRow & {
  isLastSibling: boolean;
  ancestorIsLast: boolean[];
};

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, Category[]>();

  for (const category of categories) {
    const key = category.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(category);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const build = (parentId: string | null): CategoryTreeNode[] =>
    (byParent.get(parentId) ?? []).map((category) => ({
      ...category,
      children: build(category.id),
    }));

  return build(null);
}

export function toTreeRows(
  nodes: CategoryTreeNode[],
  depth = 0,
): TreeRow[] {
  return nodes.map((node) => ({
    ...node,
    depth,
    children: toTreeRows(node.children ?? [], depth + 1),
  }));
}

export function filterTree(nodes: TreeRow[], query: string): TreeRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const filter = (list: TreeRow[]): TreeRow[] => {
    const out: TreeRow[] = [];
    for (const node of list) {
      const childMatches = filter(node.children);
      const selfMatch =
        node.name.toLowerCase().includes(q) ||
        (node.description ?? '').toLowerCase().includes(q);
      if (selfMatch || childMatches.length) {
        out.push({
          ...node,
          children: selfMatch ? node.children : childMatches,
        });
      }
    }
    return out;
  };

  return filter(nodes);
}

export function collectExpandableIds(nodes: TreeRow[]): Set<string> {
  const ids = new Set<string>();
  const walk = (list: TreeRow[]) => {
    for (const node of list) {
      if (node.children.length) {
        ids.add(node.id);
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

export function getVisibleTreeRows(
  nodes: TreeRow[],
  expanded: Set<string>,
): VisibleTreeRow[] {
  const out: VisibleTreeRow[] = [];

  const walk = (list: TreeRow[], ancestorIsLast: boolean[]) => {
    list.forEach((node, index) => {
      const isLastSibling = index === list.length - 1;
      out.push({ ...node, isLastSibling, ancestorIsLast });
      if (node.children.length && expanded.has(node.id)) {
        walk(node.children, [...ancestorIsLast, isLastSibling]);
      }
    });
  };

  walk(nodes, []);
  return out;
}
