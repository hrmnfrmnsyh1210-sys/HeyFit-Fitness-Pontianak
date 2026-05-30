$ErrorActionPreference = 'Stop'

$outputPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'BAB_II_III_Skripsi_Heyfit.docx'

if (Test-Path $outputPath) { Remove-Item $outputPath -Force }

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    $doc = $word.Documents.Add()

    # Page setup A4, margin standar skripsi (kiri 4cm, kanan/atas/bawah 3cm)
    $section = $doc.Sections.Item(1)
    $section.PageSetup.PaperSize = 7  # wdPaperA4
    $section.PageSetup.TopMargin    = $word.CentimetersToPoints(3)
    $section.PageSetup.BottomMargin = $word.CentimetersToPoints(3)
    $section.PageSetup.LeftMargin   = $word.CentimetersToPoints(4)
    $section.PageSetup.RightMargin  = $word.CentimetersToPoints(3)

    # Default font: Times New Roman 12, line spacing 1.5
    $doc.Content.Font.Name = 'Times New Roman'
    $doc.Content.Font.Size = 12
    $doc.Content.ParagraphFormat.LineSpacingRule = 1  # wdLineSpace1pt5
    $doc.Content.ParagraphFormat.SpaceAfter = 0
    $doc.Content.ParagraphFormat.SpaceBefore = 0

    $selection = $word.Selection

    function Add-Heading {
        param([string]$Text, [int]$Level = 1, [bool]$Center = $false)
        $selection.Style = $doc.Styles.Item("Heading $Level")
        $selection.Font.Name = 'Times New Roman'
        $selection.Font.Color = 0  # black
        if ($Level -eq 1) {
            $selection.Font.Size = 14
            $selection.Font.Bold = $true
        } elseif ($Level -eq 2) {
            $selection.Font.Size = 12
            $selection.Font.Bold = $true
        } else {
            $selection.Font.Size = 12
            $selection.Font.Bold = $true
        }
        $selection.ParagraphFormat.Alignment = if ($Center) { 1 } else { 0 }
        $selection.ParagraphFormat.LineSpacingRule = 1
        $selection.ParagraphFormat.SpaceBefore = 12
        $selection.ParagraphFormat.SpaceAfter = 6
        $selection.TypeText($Text)
        $selection.TypeParagraph()
    }

    function Add-Paragraph {
        param([string]$Text, [bool]$Indent = $true, [bool]$Justify = $true)
        $selection.Style = $doc.Styles.Item('Normal')
        $selection.Font.Name = 'Times New Roman'
        $selection.Font.Size = 12
        $selection.Font.Bold = $false
        $selection.Font.Italic = $false
        $selection.ParagraphFormat.Alignment = if ($Justify) { 3 } else { 0 }  # 3 = justify
        $selection.ParagraphFormat.LineSpacingRule = 1
        $selection.ParagraphFormat.FirstLineIndent = if ($Indent) { $word.CentimetersToPoints(1.27) } else { 0 }
        $selection.ParagraphFormat.SpaceBefore = 0
        $selection.ParagraphFormat.SpaceAfter = 0
        $selection.TypeText($Text)
        $selection.TypeParagraph()
    }

    function Add-SubHeading {
        param([string]$Text)
        $selection.Style = $doc.Styles.Item('Normal')
        $selection.Font.Name = 'Times New Roman'
        $selection.Font.Size = 12
        $selection.Font.Bold = $true
        $selection.Font.Italic = $false
        $selection.ParagraphFormat.Alignment = 0
        $selection.ParagraphFormat.LineSpacingRule = 1
        $selection.ParagraphFormat.FirstLineIndent = 0
        $selection.ParagraphFormat.SpaceBefore = 6
        $selection.ParagraphFormat.SpaceAfter = 3
        $selection.TypeText($Text)
        $selection.TypeParagraph()
    }

    function Add-NumberedItem {
        param([string]$Number, [string]$Bold, [string]$Rest)
        $selection.Style = $doc.Styles.Item('Normal')
        $selection.Font.Name = 'Times New Roman'
        $selection.Font.Size = 12
        $selection.Font.Bold = $false
        $selection.Font.Italic = $false
        $selection.ParagraphFormat.Alignment = 3
        $selection.ParagraphFormat.LineSpacingRule = 1
        $selection.ParagraphFormat.FirstLineIndent = 0
        $selection.ParagraphFormat.LeftIndent = $word.CentimetersToPoints(0.75)
        $selection.ParagraphFormat.SpaceBefore = 0
        $selection.ParagraphFormat.SpaceAfter = 0
        $selection.TypeText("$Number ")
        $selection.Font.Bold = $true
        $selection.TypeText($Bold)
        $selection.Font.Bold = $false
        $selection.TypeText($Rest)
        $selection.TypeParagraph()
        $selection.ParagraphFormat.LeftIndent = 0
    }

    # ========== BAB II ==========
    Add-Heading -Text 'BAB II' -Level 1 -Center $true
    Add-Heading -Text 'LANDASAN TEORI' -Level 1 -Center $true

    Add-Heading -Text '2.1 Konsep Dasar' -Level 2

    Add-SubHeading -Text 'C. Program'

    Add-SubHeading -Text 'Definisi Program'
    Add-Paragraph -Text 'Program adalah serangkaian instruksi atau perintah yang ditulis dengan aturan tertentu dalam suatu bahasa pemrograman untuk memerintahkan komputer menyelesaikan tugas atau memecahkan suatu masalah. Program merupakan hasil dari proses pemrograman, yaitu kegiatan menulis, menguji, memperbaiki, dan memelihara kode yang membangun sebuah perangkat lunak.'

    Add-SubHeading -Text 'Karakteristik Pembuatan Program'
    Add-Paragraph -Text 'Dalam membangun sebuah program yang baik, terdapat beberapa karakteristik yang harus diperhatikan:'
    Add-NumberedItem -Number '1.' -Bold 'Kebenaran (Correctness)' -Rest ' — program harus menghasilkan output yang sesuai dengan spesifikasi kebutuhan.'
    Add-NumberedItem -Number '2.' -Bold 'Keandalan (Reliability)' -Rest ' — program mampu berjalan stabil tanpa terjadinya kesalahan (error/bug) yang fatal.'
    Add-NumberedItem -Number '3.' -Bold 'Efisiensi (Efficiency)' -Rest ' — program dapat dijalankan dengan penggunaan sumber daya (memori, processor, jaringan) yang optimal.'
    Add-NumberedItem -Number '4.' -Bold 'Kemudahan Penggunaan (Usability)' -Rest ' — antarmuka program mudah dipahami dan digunakan oleh pengguna akhir.'
    Add-NumberedItem -Number '5.' -Bold 'Kemudahan Pemeliharaan (Maintainability)' -Rest ' — kode program terstruktur sehingga mudah dimodifikasi dan dikembangkan di kemudian hari.'
    Add-NumberedItem -Number '6.' -Bold 'Portabilitas (Portability)' -Rest ' — program dapat dijalankan pada berbagai platform/perangkat (responsif terhadap desktop, tablet, maupun smartphone).'

    Add-SubHeading -Text 'Bahasa Pemrograman yang Digunakan'
    Add-Paragraph -Text 'Pada penelitian ini, penulis menggunakan beberapa bahasa pemrograman dan teknologi pendukung untuk membangun website Heyfit-Fitness, antara lain:'
    Add-NumberedItem -Number '1.' -Bold 'TypeScript' -Rest ' — superset dari JavaScript yang menambahkan fitur static typing. Digunakan sebagai bahasa utama pengembangan karena mendukung tipe data yang ketat (strict mode) sehingga mengurangi potensi kesalahan pada saat kompilasi.'
    Add-NumberedItem -Number '2.' -Bold 'JavaScript' -Rest ' — bahasa pemrograman berbasis script yang dijalankan pada sisi client (browser) untuk membuat halaman web menjadi interaktif dan dinamis.'
    Add-NumberedItem -Number '3.' -Bold 'HTML (HyperText Markup Language)' -Rest ' — bahasa markup standar untuk menyusun struktur halaman web.'
    Add-NumberedItem -Number '4.' -Bold 'CSS (Cascading Style Sheets)' -Rest ' — bahasa yang digunakan untuk mengatur tampilan dan tata letak elemen HTML. Pada penelitian ini, penulisan CSS dibantu oleh framework Tailwind CSS dengan pendekatan utility-first.'
    Add-NumberedItem -Number '5.' -Bold 'SQL (Structured Query Language)' -Rest ' — bahasa query yang digunakan untuk mengelola data pada basis data relasional MySQL.'
    Add-Paragraph -Text 'Sebagai framework, penulis menggunakan Nuxt 3 yang berbasis Vue.js 3 untuk membangun antarmuka pengguna (frontend) sekaligus server-side (backend) dalam satu basis kode (full-stack), dengan dukungan Drizzle ORM untuk akses basis data.'

    Add-SubHeading -Text 'D. Basis Data'

    Add-SubHeading -Text 'Definisi Basis Data'
    Add-Paragraph -Text 'Basis data (database) adalah kumpulan data yang saling berhubungan dan terorganisasi sedemikian rupa sehingga dapat disimpan, dikelola, dan diakses kembali dengan mudah dan cepat. Basis data berfungsi untuk menghindari duplikasi data, menjaga konsistensi data, serta mempermudah pencarian dan manipulasi data oleh aplikasi.'

    Add-SubHeading -Text 'Aplikasi Basis Data yang Digunakan'
    Add-Paragraph -Text 'Aplikasi basis data yang digunakan pada website Heyfit-Fitness adalah MySQL (melalui layanan kompatibel TiDB). MySQL merupakan salah satu Relational Database Management System (RDBMS) bersifat open source yang menggunakan bahasa SQL untuk mengelola data. Penulis menggunakan MySQL karena memiliki performa yang baik, dukungan komunitas yang luas, serta kompatibel dengan berbagai bahasa pemrograman.'
    Add-Paragraph -Text 'Untuk mempermudah pengelolaan skema dan query, penulis menggunakan Drizzle ORM sebagai Object Relational Mapping yang memetakan tabel basis data ke dalam objek TypeScript, dilengkapi dengan Drizzle Kit untuk migrasi skema basis data.'

    Add-SubHeading -Text 'E. Model Pengembangan Perangkat Lunak'
    Add-Paragraph -Text 'Model pengembangan perangkat lunak yang digunakan dalam penelitian ini adalah model Waterfall (air terjun). Model waterfall merupakan salah satu model klasik dalam Software Development Life Cycle (SDLC) yang bersifat sistematis dan berurutan, di mana setiap tahapan harus diselesaikan terlebih dahulu sebelum berlanjut ke tahapan berikutnya. Model ini terdiri dari lima tahapan utama, yaitu analisis kebutuhan, desain, pembuatan kode program (implementasi), pengujian, serta pendukung (support) atau pemeliharaan (maintenance).'
    Add-Paragraph -Text 'Alasan penulis memilih model waterfall adalah karena kebutuhan dari website Heyfit-Fitness telah didefinisikan secara jelas sejak awal, ruang lingkup terbatas, dan tidak terdapat perubahan kebutuhan yang signifikan selama proses pengembangan.'

    Add-Heading -Text '2.2 Teori Pendukung' -Level 2

    Add-SubHeading -Text 'A. Entity Relationship Diagram (ERD)'

    Add-SubHeading -Text 'Definisi ERD'
    Add-Paragraph -Text 'Entity Relationship Diagram (ERD) adalah suatu diagram yang digunakan untuk memodelkan struktur data dan hubungan antar data dalam sebuah basis data secara konseptual. ERD membantu perancang sistem dalam memahami entitas-entitas yang terlibat beserta hubungan (relasi) di antara entitas tersebut sebelum diimplementasikan ke dalam basis data fisik.'

    Add-SubHeading -Text 'Komponen ERD'
    Add-Paragraph -Text 'ERD memiliki beberapa komponen utama, yaitu:'
    Add-NumberedItem -Number '1.' -Bold 'Entitas (Entity)' -Rest ' — objek nyata atau abstrak yang datanya akan disimpan, digambarkan dengan bentuk persegi panjang. Contoh: User, Member, Kelas, Pembayaran.'
    Add-NumberedItem -Number '2.' -Bold 'Atribut (Attribute)' -Rest ' — karakteristik atau properti yang melekat pada suatu entitas, digambarkan dengan bentuk elips. Contoh atribut pada entitas Member: id_member, nama, email, no_telp.'
    Add-NumberedItem -Number '3.' -Bold 'Relasi (Relationship)' -Rest ' — hubungan antara dua atau lebih entitas, digambarkan dengan bentuk belah ketupat. Contoh: Member mendaftar Kelas.'
    Add-NumberedItem -Number '4.' -Bold 'Kardinalitas (Cardinality)' -Rest ' — menggambarkan jumlah keterhubungan antar entitas, yaitu one-to-one (1:1), one-to-many (1:M), dan many-to-many (M:N).'

    Add-SubHeading -Text 'Logical Record Structure (LRS)'
    Add-Paragraph -Text 'Logical Record Structure (LRS) adalah representasi dari struktur record-record pada tabel-tabel yang terbentuk dari hasil relasi antar entitas pada ERD. LRS menggambarkan tipe record yang ada, termasuk primary key dan foreign key yang menghubungkan antar tabel, sehingga lebih dekat dengan bentuk implementasi fisik basis data.'

    Add-SubHeading -Text 'B. Unified Modelling Language (UML)'

    Add-SubHeading -Text 'Definisi UML'
    Add-Paragraph -Text 'Unified Modelling Language (UML) adalah sebuah bahasa pemodelan visual yang digunakan untuk menspesifikasikan, memvisualisasikan, membangun, dan mendokumentasikan rancangan dari sebuah sistem perangkat lunak berorientasi objek. UML menyediakan berbagai jenis diagram yang dapat digunakan sesuai kebutuhan analisis maupun perancangan.'

    Add-SubHeading -Text 'Use Case Diagram'
    Add-Paragraph -Text 'Use Case Diagram adalah diagram yang menggambarkan interaksi antara aktor (pengguna sistem) dengan fungsi-fungsi yang disediakan oleh sistem. Pada website Heyfit-Fitness, terdapat tiga aktor utama yaitu Member, Admin, dan Owner, dengan use case seperti login, pendaftaran keanggotaan, pendaftaran kelas, pemindaian QR untuk absensi, manajemen pembayaran, dan lain sebagainya.'

    Add-SubHeading -Text 'Activity Diagram'
    Add-Paragraph -Text 'Activity Diagram adalah diagram yang menggambarkan alur kerja (workflow) atau aktivitas dari sebuah sistem atau proses bisnis dari awal hingga akhir. Diagram ini menampilkan urutan aktivitas, percabangan kondisi (decision), dan paralelisme aktivitas.'

    Add-SubHeading -Text 'Class Diagram'
    Add-Paragraph -Text 'Class Diagram adalah diagram yang menggambarkan struktur statis dari sebuah sistem berbasis objek, meliputi kelas-kelas yang ada, atribut, metode, serta hubungan antar kelas. Class diagram digunakan sebagai dasar dalam merancang struktur data dan komponen aplikasi.'

    Add-SubHeading -Text 'Sequence Diagram'
    Add-Paragraph -Text 'Sequence Diagram adalah diagram yang menggambarkan interaksi antar objek dalam sebuah sistem yang disusun berdasarkan urutan waktu (kronologis). Diagram ini menjelaskan pesan (message) yang dikirim dan diterima antar objek pada saat sebuah skenario atau use case dijalankan.'

    # Page break sebelum BAB III
    $selection.InsertBreak(7)  # wdPageBreak

    # ========== BAB III ==========
    Add-Heading -Text 'BAB III' -Level 1 -Center $true
    Add-Heading -Text 'METODE PENELITIAN' -Level 1 -Center $true

    Add-Heading -Text 'Model Pengembangan Perangkat Lunak (Waterfall)' -Level 2

    Add-Paragraph -Text 'Dalam pengembangan website Heyfit-Fitness, penulis menggunakan model pengembangan perangkat lunak Waterfall yang terdiri dari beberapa tahapan sebagai berikut:'

    Add-SubHeading -Text '1. Analisis Kebutuhan Perangkat Lunak'
    Add-Paragraph -Text 'Dalam tahap awal, penulis melakukan analisa terhadap kebutuhan dalam membangun website Heyfit-Fitness, yaitu sebuah platform manajemen pusat kebugaran (gym/fitness) berbasis web. Pengguna yang terlibat terdiri dari tiga kategori, yaitu Member, Admin, dan Owner.'
    Add-NumberedItem -Number 'a.' -Bold 'Member' -Rest ' adalah pengguna yang telah memiliki akun terdaftar pada website. Member dapat melakukan pendaftaran keanggotaan, perpanjangan keanggotaan, melihat daftar kelas (Yoga, Pilates, dan lain-lain), mendaftar kelas, melihat informasi fasilitas, melakukan pembayaran, serta melakukan absensi melalui scan kode QR.'
    Add-NumberedItem -Number 'b.' -Bold 'Admin' -Rest ' adalah pengguna yang bertugas mengelola data master pada sistem, meliputi data member, data instruktur, data kelas, data pembayaran, serta memverifikasi absensi member dengan melakukan scan kode QR. Admin dapat menambah, mengubah, dan menghapus data tersebut.'
    Add-NumberedItem -Number 'c.' -Bold 'Owner' -Rest ' adalah pengguna dengan hak akses tertinggi yang bertugas memantau keseluruhan operasional dan performa bisnis melalui dashboard khusus owner.'

    Add-SubHeading -Text '2. Desain'
    Add-Paragraph -Text 'Setelah tahap analisa kebutuhan terpenuhi, dalam perancangan ini dilakukan proses perancangan sistem dan perangkat lunak dengan membagi kebutuhan perangkat keras (hardware) dan perangkat lunak (software). Proses ini berfokus pada rancangan antar muka, struktur basis data, dan rancangan struktur navigasi.'
    Add-Paragraph -Text 'Rancangan antar muka meliputi tampilan untuk member (halaman beranda, keanggotaan, kelas, fasilitas), tampilan admin (dashboard admin, manajemen member, instruktur, kelas, pembayaran, scan absensi), serta tampilan owner. Sedangkan rancangan struktur basis data meliputi Entity Relationship Diagram (ERD), Logical Record Structure (LRS), dan Spesifikasi File. Pemodelan sistem digambarkan menggunakan Unified Modelling Language (UML) yang terdiri dari Use Case Diagram, Activity Diagram, Class Diagram, dan Sequence Diagram.'

    Add-SubHeading -Text '3. Pembuatan Kode Program'
    Add-Paragraph -Text 'Setelah selesai merancang desain, penulis melakukan pengkodingan pada program yang dirancang. Adapun teknologi yang digunakan adalah HTML, CSS dengan framework Tailwind CSS, TypeScript dan JavaScript sebagai bahasa pemrograman, Nuxt 3 (berbasis Vue.js 3) sebagai framework full-stack, Drizzle ORM untuk pemetaan basis data, MySQL (TiDB) sebagai Database Management System, serta Visual Studio Code sebagai editor untuk menulis kode program. Untuk fitur absensi digunakan library html5-qrcode dan qrcode untuk pembuatan serta pembacaan kode QR.'

    Add-SubHeading -Text '4. Pengujian'
    Add-Paragraph -Text 'Kemudian untuk memastikan program yang pengkodingannya telah selesai berjalan dengan baik, penulis melakukan pengujian dengan menggunakan metode Blackbox Testing. Metode ini digunakan untuk menguji fungsionalitas sistem tanpa melihat struktur kode di dalamnya, dengan cara mencocokkan input yang diberikan dengan output yang dihasilkan.'
    Add-Paragraph -Text 'Pengujian dilakukan terhadap hak akses Member (pendaftaran akun, login, pendaftaran keanggotaan, perpanjangan keanggotaan, pendaftaran kelas, pembayaran, absensi melalui scan QR), hak akses Admin (login admin, manajemen data member, instruktur, kelas, pembayaran, scan QR absensi), serta hak akses Owner (login owner dan akses dashboard owner). Tujuan pengujian ini adalah untuk menemukan kesalahan (error) yang mungkin terjadi agar dapat diperbaiki sebelum program digunakan oleh pengguna akhir.'

    Add-SubHeading -Text '5. Pendukung (Support) atau Pemeliharaan (Maintenance)'
    Add-Paragraph -Text 'Pada tahap ini dilakukan dukungan terhadap program pada lingkungan operasionalnya serta proses pemeliharaan. Pemeliharaan mencakup koreksi dari berbagai error yang tidak ditemukan pada tahapan sebelumnya, melakukan perbaikan atas implementasi unit sistem, pengembangan layanan sistem, serta penambahan persyaratan-persyaratan baru sesuai kebutuhan pengguna di masa mendatang, seperti penambahan fitur baru pada manajemen kelas, paket keanggotaan, maupun integrasi metode pembayaran lainnya.'

    # Save as docx (wdFormatXMLDocument = 12)
    $doc.SaveAs2($outputPath, 12)
    $doc.Close()
    Write-Output "Saved: $outputPath"
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
