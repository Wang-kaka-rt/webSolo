# 源码分层说明

本项目采用 Next.js 一体化架构：前端页面和后端 API 部署在同一个 Next.js 应用中，但代码按职责分目录管理。

```text
src/
├─ app/                         # Next.js 框架入口
│  ├─ (store)/                  # 前台路由：首页、分类、商品详情
│  ├─ admin/                     # 独立的受保护后台路由
│  └─ api/                      # 后端 HTTP 入口（Route Handlers）
├─ frontend/                    # 只放浏览器/UI 相关代码
│  ├─ components/               # 页面组件、弹窗、购物车
│  ├─ context/                  # React 客户端状态
│  └─ assets/                   # 开发期前端素材
├─ backend/                     # 只放服务端业务代码
│  ├─ auth/                     # 后台会话签名与校验
│  ├─ repositories/             # MySQL 数据库读写
│  └─ services/                 # 商品、库存、预约等业务服务
└─ shared/                      # 前后端都可安全引用的代码
   ├─ catalog/                  # 共享商品种子数据
   └─ types/                    # TypeScript 类型定义
```

## 边界规则

- `frontend/` 可以引用 `shared/`，但不能引用 `backend/`。
- `backend/` 可以引用 `shared/`，但不能依赖浏览器 API 或 React 客户端状态。
- `app/api/**/route.ts` 是 HTTP 入口：只解析请求、调用 `backend/` 服务、返回响应；不写复杂业务。
- `app/(store)` 是前台路由入口：服务端页面可读取服务端数据，交互 UI 放在 `frontend/`。
- MySQL 连接位于 `backend/db/`，预约仓储和服务分别位于 `backend/repositories/` 与 `backend/services/`。
- `/admin` 与 `/api/admin/**` 会验证 HttpOnly 管理员会话；客户联系方式不会公开给前台。
- 未来的提醒服务放在 `backend/adapters/`，由预约服务调用。

`backend/services/storeService.ts` 已使用 `server-only` 标记；若有前端组件错误导入它，Next.js 会在构建时阻止。
