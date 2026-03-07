import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { deleteApiToken, fetchApiTokens, generateApiToken } from "@/lib/api";
import { Trash2, Copy, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ApiTokensPage() {
  const [newToken, setNewToken] = useState<string>("");
  const [showNewToken, setShowNewToken] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["api-tokens"],
    queryFn: fetchApiTokens,
  });

  const generateMutation = useMutation({
    mutationFn: generateApiToken,
    onSuccess: (data) => {
      setNewToken(data.token);
      setShowNewToken(true);
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      toast.success("API Token 已生成");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApiToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      toast.success("Token 已删除");
      setDeleteId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("已复制到剪贴板");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Token 管理</h1>
          <p className="text-muted-foreground">管理您的 API 访问令牌</p>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {generateMutation.isPending ? "生成中..." : "生成新 Token"}
        </Button>
      </div>

      {showNewToken && newToken && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">新 Token 已生成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">您的 API Token</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input value={newToken} readOnly className="font-mono text-sm" />
                <Button size="sm" variant="outline" onClick={() => copyToken(newToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                请立即复制保存此 Token，关闭后将无法再次查看完整内容。
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowNewToken(false)}>
              我已保存
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>现有 Token</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无 Token，点击上方按钮生成新 Token</p>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{token.tokenMasked ?? token.token}</code>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>创建于 {new Date(token.createdAt).toLocaleString("zh-CN")}</span>
                      <span>•</span>
                      <span>
                        过期时间 {new Date(token.expiresAt).toLocaleString("zh-CN")}
                      </span>
                      {token.lastUsedAt && (
                        <>
                          <span>•</span>
                       <span>
                            最后使用 {new Date(token.lastUsedAt).toLocaleString("zh-CN")}
                          </span>
                        </>
                      )}
                    </div>
                    {new Date(token.expiresAt) < new Date() && (
                      <Badge variant="destructive" className="text-xs">
                        已过期
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(token.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除此 Token 后，使用该 Token 的应用将无法继续访问 API。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
