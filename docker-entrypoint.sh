#!/bin/sh
set -e

ENV_FILE=".env"

# 防呆：docker-compose 中 `./.env:/app/.env` 单文件挂载时，
# 若宿主机不存在 .env，Docker 会自动把它创建为「目录」，
# 导致应用无法读写配置（save database config 失败）。
if [ -d "$ENV_FILE" ]; then
    echo "ERROR: ./.env 是一个目录而不是文件。" >&2
    echo "请在宿主机执行: rm -rf .env && touch .env（或按 README 下载 .env.example 为 .env），然后重新启动容器。" >&2
    exit 1
fi

# 确保 .env 存在
[ -f "$ENV_FILE" ] || : > "$ENV_FILE"

# 仅补齐缺失或为空的数据库配置项，绝不覆盖已有非空值。
# 这样安装向导 / 管理后台「迁移后切换运行库」写入 .env 的
# 数据库配置在容器重启后依然生效。
upsert_env() {
    key="$1"
    value="$2"
    if grep -q "^${key}=..*" "$ENV_FILE" 2>/dev/null; then
        return 0
    fi
    # 已有该键但值为空（或键不存在）：移除旧行后追加，避免 sed 转义问题
    if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
        grep -v "^${key}=" "$ENV_FILE" > "${ENV_FILE}.tmp" || true
        mv "${ENV_FILE}.tmp" "$ENV_FILE"
    fi
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
}

upsert_env "DATABASE_TYPE" "${DATABASE_TYPE:-sqlite}"
upsert_env "DATABASE_PATH" "${DATABASE_PATH:-storage/data/skyimage.db}"

# 启动应用
exec ./api
