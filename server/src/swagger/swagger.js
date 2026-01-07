import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Enterprise Task Management API",
      version: "1.0.0",
      description:
        "API Documentation cho hệ thống quản lý công việc Enterprise. Hỗ trợ Auth, RBAC, Task Management và AI Integration.",
      contact: {
        name: "me",
        email: "tuanktvn2001@gmail.com",
      },
    },
    servers: [
      { url: "http://localhost:3000/api", description: "Local Development" },
    ],
    tags: [
      { name: "AI Agent", description: "Gemini AI Integration" },
      { name: "Auth", description: "Authentication & Session Management" },
      { name: "Tasks", description: "Task CRUD & Assignments" },
      { name: "Teams", description: "Team Collaboration & Invites" },
      { name: "Users", description: "User Management (Admin)" },
      { name: "Notifications", description: "User Notifications" },
      { name: "Reports", description: "Dashboard Analytics" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // --- 1. ENTITIES ---
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "60d0fe4f5311236168a109ca" },
            name: { type: "string", example: "Phan Dinh Tuan" },
            email: {
              type: "string",
              format: "email",
              example: "tuan@example.com",
            },
            role: {
              type: "string",
              enum: ["admin", "team_lead", "user", "viewer"],
              example: "user",
            },
            avatar: {
              type: "string",
              example: "https://ui-avatars.com/api/?name=Tuan+Phan",
            },
            teamId: { type: "string", description: "ID của Team (nếu có)" },
          },
        },
        Team: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6671234abc567def" },
            name: { type: "string", example: "Engineering Team" },
            description: { type: "string", example: "Core backend developers" },
            leadId: { $ref: "#/components/schemas/User" },
            members: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  role: { type: "string", enum: ["member", "viewer"] },
                  joinedAt: { type: "string", format: "date-time" },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", example: "TASK-1001" },
            title: { type: "string", example: "Fix login bug" },
            description: {
              type: "string",
              example: "Login page shows 500 error on submit",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "review", "done"],
              example: "in_progress",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              example: "high",
            },
            dueDate: { type: "string", format: "date-time" },
            assignedTo: { $ref: "#/components/schemas/User" },
            createdBy: { $ref: "#/components/schemas/User" },
            tags: { type: "array", items: { type: "string" } },
            visibility: { type: "string", enum: ["private", "team", "public"] },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            type: {
              type: "string",
              enum: ["TEAM_INVITE", "TASK_ASSIGNED", "SYSTEM"],
            },
            title: { type: "string" },
            message: { type: "string" },
            isRead: { type: "boolean" },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // --- 2. REQUESTS (INPUT DTOs - Data sent by User) ---
        // Login Request
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "admin@gmail.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Admin@123456",
            },
          },
        },
        // Register Request
        RegisterRequest: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: { type: "string", example: "New User" },
            email: {
              type: "string",
              format: "email",
              example: "user@taskflow.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "User@123",
            },
          },
        },
        // Create Task Request (Không có id, createdBy, createdAt...)
        CreateTaskRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Review PR #123" },
            description: {
              type: "string",
              example: "Review code changes for authentication module",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              default: "medium",
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "review", "done"],
              default: "todo",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              example: "2024-12-31T23:59:59Z",
            },
            assignedTo: {
              type: "string",
              description: "User ID (ObjectId)",
              example: "60d0fe4f5311236168a109ca",
            },
            visibility: {
              type: "string",
              enum: ["private", "team", "public"],
              default: "private",
            },
          },
        },
        // Create Team Request
        CreateTeamRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Frontend Team" },
            description: { type: "string", example: "Responsible for UI/UX" },
          },
        },

        // --- 3. RESPONSES (Standardized API Responses) ---
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 50 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            code: { type: "integer", example: 400 },
            message: { type: "string", example: "Invalid input data" },
            stack: {
              type: "string",
              description: "Only visible in development",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Thành công" },
            status: { type: "integer", example: 200 },
            metadata: { type: "object" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Chỉ định file chứa JSDoc comments để Swagger đọc
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const specs = swaggerJsdoc(options);

export default specs;