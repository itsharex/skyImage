import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ImageGrid } from "@/features/files/components/ImageGrid";
import {
  fetchAdminImages,
  fetchSiteConfig,
  deleteAdminImage,
  deleteAdminImagesBatch,
  updateAdminImageVisibility,
  updateAdminImagesVisibilityBatch
} from "@/lib/api";

export function AdminImagesPage() {
  const pageSize = 80;
  const queryClient = useQueryClient();
  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
    staleTime: 5 * 60 * 1000
  });
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["admin", "images"],
    queryFn: ({ pageParam = 0 }) =>
      fetchAdminImages({ limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.reduce((total, page) => total + page.length, 0);
    }
  });

  const files = data?.pages.flatMap((page) => page) ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminImage(id),
    onSuccess: () => {
      toast.success("已删除图片");
      queryClient.invalidateQueries({ queryKey: ["admin", "images"] });
    }
  });

  const visibilityMutation = useMutation({
    mutationFn: (payload: { id: number; visibility: "public" | "private" }) =>
      updateAdminImageVisibility(payload.id, payload.visibility),
    onSuccess: () => {
      toast.success("权限已更新");
      queryClient.invalidateQueries({ queryKey: ["admin", "images"] });
    },
    onError: (error) => toast.error(error.message || "更新权限失败")
  });

  const batchVisibilityMutation = useMutation({
    mutationFn: (payload: { ids: number[]; visibility: "public" | "private" }) =>
      updateAdminImagesVisibilityBatch(payload.ids, payload.visibility),
    onSuccess: () => {
      toast.success("批量权限已更新");
      queryClient.invalidateQueries({ queryKey: ["admin", "images"] });
    },
    onError: (error) => toast.error(error.message || "批量更新权限失败")
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => deleteAdminImagesBatch(ids),
    onSuccess: () => {
      toast.success("批量删除成功");
      queryClient.invalidateQueries({ queryKey: ["admin", "images"] });
    },
    onError: (error) => toast.error(error.message || "批量删除失败")
  });

  const deletingId =
    typeof deleteMutation.variables === "number"
      ? deleteMutation.variables
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">图片管理</h1>
        <p className="text-muted-foreground">
          管理所有用户的上传内容，支持审核与删除。
        </p>
      </div>
      <ImageGrid
        files={files}
        isLoading={isLoading}
        hasMore={Boolean(hasNextPage)}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={async () => {
          await fetchNextPage();
        }}
        loadRowsPerBatch={siteConfig?.imageLoadRows ?? 4}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        deletingId={deletingId}
        showOwner
        onVisibilityChange={(id, visibility) => {
          void visibilityMutation.mutateAsync({ id, visibility });
        }}
        onBatchVisibilityChange={(ids, visibility) => {
          void batchVisibilityMutation.mutateAsync({ ids, visibility });
        }}
        onBatchDelete={(ids) => {
          void batchDeleteMutation.mutateAsync(ids);
        }}
      />
    </div>
  );
}
