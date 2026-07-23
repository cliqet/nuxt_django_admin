### Intro
This project is an SPA built from SolidJS and is used as the user interface for the [custom_django_admin](https://github.com/cliqet/custom_django_admin). Think of this as Django admin's templates but made with a frontend framework for a more flexible customization. 

### Prerequisites
- Node v24.12.0
- Nuxt 4.2.2
- Tailwind 4.1.18
- Typescript 5.9.3

### Before starting
There are some custom pages here that were made to work with the demo mode 
of the backend and you will need to remove this once you start your own project. 
- `app.pages.custom.classification`
The rest is up to you to modify according to your needs. By default, this should work without any modifications and everything should update with changes to the admin backend.

### Setting up the application in your local environment 
1. Make sure you have a `.env` file in the root directory and populate the values. Refer to 
`.env.example` for more information.
2. Run
```bash
npm install
```
then 
```bash
npm run dev
```

### Integrations
The login form is protected using Cloudflare turnstile so you need to 
have an account and setup your turnstile widget.

### Screenshots
#### Login
<img width="1418" height="475" alt="nuxt_admin_login" src="https://github.com/user-attachments/assets/f7c9fedb-bbd1-47a7-a5c9-5e874e0c4027" />


#### App Search
<img width="1418" height="539" alt="nuxt_admin_app_search" src="https://github.com/user-attachments/assets/77fb4756-56ff-4a7c-b9bf-6433dc0c2c7f" />


#### Forms
<img width="1418" height="549" alt="nuxt_admin_form1" src="https://github.com/user-attachments/assets/256c4b0c-3d01-4b93-8d5d-c7ed94ba9e11" />
<img width="1418" height="549" alt="nuxt_admin_form2" src="https://github.com/user-attachments/assets/e5d4c058-27e7-499c-9681-c6a519ac3b11" />
<img width="1418" height="549" alt="nuxt_admin_form3" src="https://github.com/user-attachments/assets/27ab1322-5c59-433b-a35d-44e0f5a93d4c" />
<img width="1418" height="549" alt="nuxt_admin_form4" src="https://github.com/user-attachments/assets/6603eab8-b196-46f5-8ac1-4860ca5d9a20" />


### Inlines
<img width="1418" height="599" alt="nuxt_admin_inlines" src="https://github.com/user-attachments/assets/f3dd3e46-4675-474b-8648-e3c4b284289a" />


#### Listview
<img width="1418" height="609" alt="nuxt_admin_listview" src="https://github.com/user-attachments/assets/78400054-82f2-4826-a0e2-b99936d5f062" />


### Lightmode
<img width="1418" height="609" alt="nuxt_admin_lightmode" src="https://github.com/user-attachments/assets/4ad7fdac-20b5-42d6-9592-bcaee57fb4ea" />


### Mobile
<img width="325" height="563" alt="nuxt_admin_mobile" src="https://github.com/user-attachments/assets/3908544e-dd6f-466e-9ba8-96c96de45741" />
