import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">接口文档</h1>
        <p className="text-muted-foreground">使用 API 将上传流程接入到你的脚本或自动化工具。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lsky v2 兼容接口</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">接口地址</h3>
            <Badge variant="secondary" className="font-mono">{window.location.origin}/api/v1</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">认证方式</h3>
            <p className="text-muted-foreground mb-2">使用 Bearer Token 认证，在请求头中添加：</p>
            <pre className="bg-muted p-3 rounded-md overflow-x-auto">
              <code>Authorization: Bearer YOUR_TOKEN_HERE</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">上传图片</h3>
            <p className="text-muted-foreground mb-2">
              <Badge variant="secondary">POST</Badge> <code>/api/v1/upload</code>
            </p>
            <p className="text-muted-foreground mb-2">请求参数（multipart/form-data）：</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li><code>file</code> - 图片文件（必填）</li>
              <li><code>strategy_id</code> - 存储策略 ID（可选）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">获取用户资料</h3>
            <p className="text-muted-foreground mb-2">
              <Badge variant="secondary">GET</Badge> <code>/api/v1/profile</code>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">获取策略列表</h3>
            <p className="text-muted-foreground mb-2">
              <Badge variant="secondary">GET</Badge> <code>/api/v1/strategies</code>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">图片列表</h3>
            <p className="text-muted-foreground mb-2">
              <Badge variant="secondary">GET</Badge> <code>/api/v1/images</code>
            </p>
            <p className="text-muted-foreground mb-2">查询参数：</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li><code>page</code> - 页码（可选）</li>
              <li><code>order</code> - 排序方式：newest/earliest（可选）</li>
              <li><code>keyword</code> - 搜索关键字（可选）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">删除图片</h3>
            <p className="text-muted-foreground mb-2">
              <Badge variant="secondary">DELETE</Badge> <code>/api/v1/images/:key</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>原生接口说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            使用 Cookie + Session 鉴权。登录后会自动写入会话 Cookie：<Badge variant="secondary">POST /api/auth/login</Badge>
          </p>
          <p>
            上传文件：<Badge variant="secondary">POST /api/files</Badge>，支持表单字段 <code>file</code> 与 <code>visibility</code>。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
