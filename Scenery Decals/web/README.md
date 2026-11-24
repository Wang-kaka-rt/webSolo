# Pangpangshop 预约站

这是一个 Next.js 一体化库存预约网站。客户提交预约后，服务端通过 MySQL 事务预留库存；当前版本不包含在线支付。

## 本地启动

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 配置 MySQL

1. 复制 `.env.example` 为 `.env.local`。
2. 设置 MySQL 连接字符串：

```env
DATABASE_URL="mysql://用户名:密码@127.0.0.1:3306/pangpangshop"
RESERVATION_HOLD_HOURS="48"
ADMIN_PASSWORD="单独设置一个强密码"
ADMIN_SESSION_SECRET="一段足够长的随机字符串"
```

3. 创建数据库后执行：

```powershell
npm run db:migrate
npm run db:seed
npm run reservations:expire
```

迁移会创建商品、库存、预约、客户联系方式和预约商品项等表。种子命令会导入现有 10 个商品，并为每个商品设置初始库存 10。

## 管理后台

打开 `http://localhost:3000/admin`。后台使用“管理员邮箱 + 密码”登录：在 `.env.local` 设置 `ADMIN_SESSION_SECRET`、`INITIAL_ADMIN_EMAIL`、`INITIAL_ADMIN_PASSWORD` 后，执行 `npm run db:seed-admin`。管理员密码经过加盐哈希后存入 MySQL，不会明文写入数据库或 Git。

后台可查看客户预约和联系方式、记录仅内部可见的跟进备注，并更新预约状态。将预约标记为“已拒绝”“已取消”或“已过期”时，系统会释放预留库存；标记为“已完成”时，系统会扣减实际库存。

## 常用命令

```powershell
npm run lint
npm run build
npm run db:migrate
npm run db:seed
npm run db:seed-admin
```

## 代码结构

- `src/app/(store)`：前台页面路由
- `src/app/api`：后端 HTTP 接口入口
- `src/frontend`：浏览器 UI 与交互状态
- `src/backend`：MySQL、库存与预约服务
- `src/shared`：前后端共用类型与商品数据

更完整的设计参见 `docs/ARCHITECTURE.md`。

## 库存与预约维护

- 登录 `/admin` 后，可通过“库存管理”调整每项商品的实际在库数；系统会拒绝将库存改到低于已预约数量，并记录调整原因。
- 后台“预约管理”页的“释放过期预约”按钮会把超过预约有效期的记录标记为“已过期”，并自动释放其预留库存；这个操作不依赖 Hostinger Cron Jobs。
- `npm run reservations:expire` 仍保留用于本地维护或未来迁移到支持 Node.js 定时任务的平台。
