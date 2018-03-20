define({ "api": [
  {
    "type": "get",
    "url": "/",
    "title": "Query user public profiles",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "find",
            "description": "<p>Optional Mongo query to perform</p>"
          }
        ]
      }
    },
    "description": "<p>Returns all user profiles that matches query</p>",
    "group": "Profile",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>A valid JWT token &quot;Bearer: xxxxx&quot;</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "User",
            "description": "<p>profiles</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Profile",
    "name": "Get"
  },
  {
    "group": "Profile",
    "type": "get",
    "url": "/private/:sub?",
    "title": "Get Private Profile",
    "description": "<p>Get user's private profile. Admin can specify optional :sub to retrieve other user's provate profile</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>A valid JWT token &quot;Bearer: xxxxx&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Profile",
    "name": "GetPrivateSub"
  },
  {
    "group": "Profile",
    "type": "get",
    "url": "/public/:sub?",
    "title": "Get Public Profile",
    "description": "<p>Get user's public profile. Optional :sub will be default to user's sub from jwt Set to any other user's sub to query other user's public profile</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>A valid JWT token &quot;Bearer: xxxxx&quot; (optional)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Profile",
    "name": "GetPublicSub"
  },
  {
    "group": "Profile",
    "type": "put",
    "url": "/private/:sub?",
    "title": "Set Private Profile",
    "description": "<p>Update user's private profile. Admin can set :sub parameter to update other user's private profile</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>A valid JWT token &quot;Bearer: xxxxx&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Profile",
    "name": "PutPrivateSub"
  },
  {
    "group": "Profile",
    "type": "put",
    "url": "/public/:sub?",
    "title": "Put Public Profile",
    "description": "<p>Update user's public profile. :sub will be default to user's sub from jwt</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>A valid JWT token &quot;Bearer: xxxxx&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "api/controllers.js",
    "groupTitle": "Profile",
    "name": "PutPublicSub"
  }
] });
