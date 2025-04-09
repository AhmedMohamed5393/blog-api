export const createBlogResponse = {
    "data": {
      "title": "Title of the new blog",
      "content": "Blog Content",
      "tags": ["Welcome_onboard"],
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-01-13T23:34:55.431Z",
      "updated_at": "2025-01-13T23:34:55.431Z",
      "deleted_at": null
    },
    "message": "blog is created successfully",
    "status": true
}; 

export const findBlogsListResponse = {
    "data": {
      "meta": {
        "page": 1,
        "take": 10,
        "itemsPerPage": 1,
        "total": 1,
        "pageCount": 1,
        "hasPreviousPage": false,
        "hasNextPage": false
      },
      "blogs": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "New blog post",
          "content": "Hi everyone",
          "tags": ["Welcome_onboard"],
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440044",
            "email": "ahmedmohamedalex93@gmail.com",
          },
          "created_at": "2025-01-13T22:53:41.354Z"
        }
      ]
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const findBlogDetailsResponse = {
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "New blog post",
      "content": "Hi everyone",
      "tags": ["Welcome_onboard"],
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440044",
        "email": "ahmedmohamedalex93@gmail.com",
        "role": "Editor",
      },
      "created_at": "2025-01-13T22:53:41.354Z",
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const updateBlogResponse = {
    "data": { "id": "550e8400-e29b-41d4-a716-446655440000" },
    "message": "blog is updated successfully",
    "status": true
};

export const deleteBlogResponse = {
    "data": {},
    "message": "blog is deleted successfully",
    "status": true
};
