# dotnet-boilerplate

Bu repository, modern ve ölçeklenebilir .NET projeleri için temel alınabilecek bir **boilerplate** yapı sunmayı hedeflemektedir. Proje tamamlandığında, aşağıdaki özellikleri barındıran bir başlangıç noktası olacaktır.

## 🚧 Geliştirme Aşamasında - Notlar

Aşağıdaki başlıklar, takım toplantısında belirlenen temel yapı taşlarını ve hedefleri içermektedir:

### 🔐 Authentication
- Email Password Auth & JWT
- Opsiyonel **Multi-Factor Authentication (MFA)**
- Opsiyonel **OAuth2** desteği (Google, GitHub vs.)

### ⚙️ Options Panel
- Kullanıcı tercihleri (ör. tema, dil seçimi)
- UI/UX ayarlarının yönetimi

### 🧠 Semantic Kernel Entegrasyonu
- **Planner**, **ChatCompletion**, **Agent** gibi yapılarla entegrasyon
- AI destekli iş akışı

### 🗃️ Database Bağlantı Yapısı
- EFCore
- **PostgreSQL** ve **MSSQL** desteği
- Sağlam ve kolay genişletilebilir yapı

### 🧱 Design Pattern Kullanımı
- **Decorator** başta olmak üzere yaygın kullanılan design pattern’ler
- Kod okunabilirliği ve sürdürülebilirliği artırma

### ✉️ Entegrasyonlar
- **Email Client** (SMTP, SendGrid vb.)
- **SMS Client** (Twilio, Netgsm vb.)
- Gerektiğinde ek servis entegrasyonlarına açık yapı
- Push Notification

### 🐳 Docker Desteği
- Uygulama ve bağlı servisler için hazır **Dockerfile**, **docker-compose**
- Lokal ve production ortamlar için container yapısı

### 🧩 Mimari
- **Layered Architecture**
  - WebApi(Controllers)
  - Business
  - Entities
  - Infrastructure
- Temiz, ayrıştırılmış, test edilebilir yapı

---

## 📅 Hedef

Boilerplate’in **hackathon**, **yeni projeler**, ya da **MVP** süreçlerinde hızlı ve sağlam başlangıçlar için kullanılabilir hale getirilmesi.

---

> 🧠 Not: Bu belge proje tamamlanana kadar bir hafıza kartı görevi görür. Yapılar oluştukça örnek kodlar ve kullanım senaryoları ile güncellenecektir.
