const RAW_STORES_DATA = `
"https://www.google.com/maps/place/Liofa+Florist+%28buket+bunga,+buket+uang,+buket+snack%29/data=!4m7!3m6!1s0x2e7a573ad3932aab:0x5d02737fb975da8a!8m2!3d-7.807951!4d110.3374451!16s%2Fg%2F11fhyl20k1!19sChIJqyqT0zpXei4Ritp1uX9zAl0?authuser=0&hl=id&rclk=1","Liofa Florist (buket bunga, buket uang, buket snack)",Toko Bunga,Jl. Sonopakis Kidul No.RT 01,0831-4564-8653
https://www.google.com/maps/place/Buketnanaa_Jogja/data=!4m7!3m6!1s0x2e7a57fbc3b0e5cd:0xd772efb253430624!8m2!3d-7.8036624!4d110.343603!16s%2Fg%2F11l_8_hgfl!19sChIJzeWww_tXei4RJAZDU7Lvctc?authuser=0&hl=id&rclk=1,Buketnanaa_Jogja,Toko Bunga,Jl. Nitipuran No.271,0882-0067-84608
https://www.google.com/maps/place/Bouquet+and+Hampers+by+Arth.la/data=!4m7!3m6!1s0x2e7a570a8e2721b5:0xf120fcac761820e2!8m2!3d-7.8092158!4d110.3443523!16s%2Fg%2F11sc1k5ms3!19sChIJtSEnjgpXei4R4iAYdqz8IPE?authuser=0&hl=id&rclk=1,Bouquet and Hampers by Arth.la,Toko Bunga,Jl. Kesejahteraan Sosial No.7,0882-1270-8616
https://www.google.com/maps/place/ElisCraft+Jogja/data=!4m7!3m6!1s0x2e7a575743515cf7:0x1b641a2eaf11e52f!8m2!3d-7.8078766!4d110.3496561!16s%2Fg%2F11hzhvzsgl!19sChIJ91xRQ1dXei4RL-URry4aZBs?authuser=0&hl=id&rclk=1,ElisCraft Jogja,Toko Bunga,Jl. Patangpuluhan No.7,0855-2075-2728
https://www.google.com/maps/place/PUSAT+KADO+DAN+BUNGA+JOGJA+%28+BUKET+UANG+%2F+BUKET+WISUDA+%2F+BUKET+SNACK+%2F+BALON+%2F+BONEKA+%2F+KADO+ULTAH+%2F+KADO+WISUDA+JOGJA+%29/data=!4m7!3m6!1s0x2e7a578a110b0a33:0x9b93d8adcd0b049e!8m2!3d-7.812559!4d110.3433893!16s%2Fg%2F11mpblr9cw!19sChIJMwoLEYpXei4RngQLza3Yk5s?authuser=0&hl=id&rclk=1,PUSAT KADO DAN BUNGA JOGJA ( BUKET UANG / BUKET WISUDA / BUKET SNACK / BALON / BONEKA / KADO ULTAH / KADO WISUDA JOGJA ),Toko Bunga,Jl. Nitiprayan No.RT.01,0896-1610-5395
https://www.google.com/maps/place/Rakabumi+florist/data=!4m7!3m6!1s0x2e7a57edca447125:0xd66024000c2f8338!8m2!3d-7.8094866!4d110.350126!16s%2Fg%2F11dzw87486!19sChIJJXFEyu1Xei4ROIMvDAAkYNY?authuser=0&hl=id&rclk=1,Rakabumi florist,Toko Bunga,Jl. Bugisan No.19,0895-3901-34107
"https://www.google.com/maps/place/Jocets.id+%28Buket+bunga,+buket+snack,+buket+uang,+dan+hadiah+jogja%29/data=!4m7!3m6!1s0x2e7a59001b437f61:0x290e4e1dfc86d14b!8m2!3d-7.7969847!4d110.3421508!16s%2Fg%2F11xcj06gv_!19sChIJYX9DGwBZei4RS9GG_B1ODik?authuser=0&hl=id&rclk=1","Jocets.id (Buket bunga, buket snack, buket uang, dan hadiah jogja)",Toko Bunga,Ngewotan No.RT.11,0819-0300-6766
"https://www.google.com/maps/place/Ellemy+Creative+Studio+%28Florist,+Bouquet+%26+Decoration%29/data=!4m7!3m6!1s0x2e7a5765d302ca4d:0x26e440ecea283cdf!8m2!3d-7.8097122!4d110.3353933!16s%2Fg%2F11rd3ghj67!19sChIJTcoC02VXei4R3zwo6uxA5CY?authuser=0&hl=id&rclk=1","Ellemy Creative Studio (Florist, Bouquet & Decoration)",Toko Bunga,Gg. Pandawa,0896-8838-2926
"https://www.google.com/maps/place/ Kaluna+Studio+%28+Mahar+,+Ringtray+,+Bouquet+,+Seserahan+,+Kotak+cincin+,+Ring+box+%29/data=!4m7!3m6!1s0x2e7a57002e7de091:0xaf8dc8fb43576aa5!8m2!3d-7.8110695!4d110.3338161!16s%2Fg%2F11y4zxp43h!19sChIJkeB9LgBXei4RpWpXQ_vIja8?authuser=0&hl=id&rclk=1","Kaluna Studio ( Mahar , Ringtray , Bouquet , Seserahan , Kotak cincin , Ring box )",Toko Bunga,"Depan masjid An-Nur, Perumahan SBI ( Sidorejo bumi indah J202, Jl. Wates",0882-2177-4973
https://www.google.com/maps/place/sam.florist/data=!4m7!3m6!1s0x2e7a57d5ad211e25:0xeb3a1f7ad4acba32!8m2!3d-7.803682!4d110.3476392!16s%2Fg%2F11ff0w0740!19sChIJJR4hrdVXei4RMrqs1HofOus?authuser=0&hl=id&rclk=1,sam.florist,Toko Bunga,Jl. Setiaki No.23,0857-8681-8840
"https://www.google.com/maps/place/OMEGA+FLORIST+UMY+%28+Buket+Wisuda,+Buket+Boneka+Wisuda,+Buket+Uang,+Buket+fresh,+dll%29/data=!4m7!3m6!1s0x2e7af9b59da5538d:0x782c685fff103e9c!8m2!3d-7.8144608!4d110.3220754!16s%2Fg%2F11vdw2mny5!19sChIJjVOlnbX5ei4RnD4Q_19oLHg?authuser=0&hl=id&rclk=1","OMEGA FLORIST UMY ( Buket Wisuda, Buket Boneka Wisuda, Buket Uang, Buket fresh, dll)",Toko Bunga,Jl. Rajawali No.125,0852-2889-1889
https://www.google.com/maps/place/Prive+Flora/data=!4m7!3m6!1s0x2e7a570a0acb530b:0x492fa896520dcbd0!8m2!3d-7.8042696!4d110.3509926!16s%2Fg%2F11tsmmryz7!19sChIJC1PLCgpXei4R0MsNUpaoL0k?authuser=0&hl=id&rclk=1,Prive Flora,Toko Bunga,Jl. Kapten Piere Tendean No.36A,0878-8500-8380
"https://www.google.com/maps/place/Papabouquet+UMY+-+Florist,+Papan+Bunga+%26+Hampers+Jogja/data=!4m7!3m6!1s0x2e7af9f083c29e81:0x4bafeccd87b73bd1!8m2!3d-7.8071859!4d110.3240318!16s%2Fg%2F11y7n9l_n8!19sChIJgZ7Cg_D5ei4R0Tu3h83sr0s?authuser=0&hl=id&rclk=1","Papabouquet UMY - Florist, Papan Bunga & Hampers Jogja",Toko Bunga,"58VF+4JM, Jl. Anggrek Tegalrejo, Geblagan, Tamantirto, Kec. Kasihan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55184",0852-3223-3667
https://www.google.com/maps/place/And%27s+Project+GIFT+%26+BOUQUET/data=!4m7!3m6!1s0x2e7a57f685fe44dd:0x91e0806e593e595a!8m2!3d-7.8143296!4d110.3339395!16s%2Fg%2F11kj5_09g7!19sChIJ3UT-hfZXei4RWlk-WW6A4JE?authuser=0&hl=id&rclk=1,And's Project GIFT & BOUQUET,Toko Bunga,"58PM+7G8, Jl. Ambarbinangun",0821-3377-1115
https://www.google.com/maps/place/TOKO+BUNGA+SEKAR+WANGI/data=!4m7!3m6!1s0x2e7a570031988b5b:0xf9813e4c19681d50!8m2!3d-7.8131537!4d110.3354362!16s%2Fg%2F11yggtw4f8!19sChIJW4uYMQBXei4RUB1oGUw-gfk?authuser=0&hl=id&rclk=1,TOKO BUNGA SEKAR WANGI,Toko Bunga,58PP+P5V,0882-2180-6161
https://www.google.com/maps/place/Toko+Hadiah+Dried+Blume+Bouquet/data=!4m7!3m6!1s0x2e7a571f61bb65c5:0xa5e8cae8ff6ee9f5!8m2!3d-7.8224159!4d110.3590126!16s%2Fg%2F11rd7x417f!19sChIJxWW7YR9Xei4R9elu_-jK6KU?authuser=0&hl=id&rclk=1,Toko Hadiah Dried Blume Bouquet,Toko Bunga,Jalan Minggiran MJ 2 / 1085 B,0821-3594-2480
https://www.google.com/maps/place/Laurelly/data=!4m7!3m6!1s0x2e7a571d81f6ccc1:0x347b112f2e553d8a!8m2!3d-7.812222!4d110.3517719!16s%2Fg%2F11ry7tcc11!19sChIJwcz2gR1Xei4Rij1VLi8RezQ?authuser=0&hl=id&rclk=1,Laurelly,Toko Bunga Kering,"59Q2+4P6, Jl. Sugeng Jeroni",0819-4923-8224
https://www.google.com/maps/place/Amira+comel/data=!4m7!3m6!1s0x2e7a5747d1d87829:0xa39b43d102b91e24!8m2!3d-7.813823!4d110.3312651!16s%2Fg%2F11y3q3h_wc!19sChIJKXjY0UdXei4RJB65AtFDm6M?authuser=0&hl=id&rclk=1,Amira comel,Toko Bunga,Tempuran No.RT 9,0812-2874-6522
https://www.google.com/maps/place/Give+Bouquet/data=!4m7!3m6!1s0x2e7a590d192e39c1:0xd535f2d03c7dcc76!8m2!3d-7.7925438!4d110.3618922!16s%2Fg%2F11j3w8h3ft!19sChIJwTkuGQ1Zei4Rdsx9PNDyNdU?authuser=0&hl=id&rclk=1,Give Bouquet,Toko Bunga,Jl. Sosrowijayan,0895-0343-1975
https://www.google.com/maps/place/Buket+bunga+Jogja+floristia/data=!4m7!3m6!1s0x2e7af9c711dc5629:0x9c039973608fa6d5!8m2!3d-7.8275763!4d110.3266791!16s%2Fg%2F11t259bf5r!19sChIJKVbcEcf5ei4R1aaPYHOZA5w?authuser=0&hl=id&rclk=1,Buket bunga Jogja floristia,Toko Bunga,Kasihan rt 07,0896-5322-1764
https://www.google.com/maps/place/BUKET+%26+HAMPERS+JOGJA+-+AD+BOUQUET+CRAF/data=!4m7!3m6!1s0x2e7a5778443118db:0x5de4465b8c015577!8m2!3d-7.8288686!4d110.3395554!16s%2Fg%2F11t0rd5fgg!19sChIJ2xgxRHhXei4Rd1UBjFtG5F0?authuser=0&hl=id&rclk=1,BUKET & HAMPERS JOGJA - AD BOUQUET CRAF,Kerajinan,Cemplung Lor RT 01 DK. VI,0898-9293-604
https://www.google.com/maps/place/Jeje+Blossoms+Florist/data=!4m7!3m6!1s0x2e7a57357f221f89:0x984f195896b40f52!8m2!3d-7.8144539!4d110.3230228!16s%2Fg%2F11g1zjps0b!19sChIJiR8ifzVXei4RUg-0llgZT5g?authuser=0&hl=id&rclk=1,Jeje Blossoms Florist,Toko Bunga,"Gatak, Jl. Rajawali, Ngebel, Tamantirto, Kasihan, Bantul, DIY (55183",0812-2505-3099
https://www.google.com/maps/place/DREAM+FLORIST/data=!4m7!3m6!1s0x2e7af90054712123:0xf2a810f6bd235fa3!8m2!3d-7.8062599!4d110.3177294!16s%2Fg%2F11vqvvgvl1!19sChIJIyFxVAD5ei4Ro18jvfYQqPI?authuser=0&hl=id&rclk=1,DREAM FLORIST,Toko,58VF+663,0812-1823-0083
https://www.google.com/maps/place/Yiega+Buket+Jogja+%28online+store%2Fhomestore%29/data=!4m7!3m6!1s0x2e7af96072ca5a87:0x9c60aa68af3eea8b!8m2!3d-7.8154375!4d110.3178125!16s%2Fg%2F11l6xhr56r!19sChIJh1rKcmD5ei4Ri-o-r2iqYJw?authuser=0&hl=id&rclk=1,Yiega Buket Jogja (online store/homestore),Toko Bunga,"58M9+R42 Tamantirto, Kabupaten Bantul, Daerah Istimewa",0851-6123-8821
https://www.google.com/maps/place/tata+Florist/data=!4m7!3m6!1s0x2e7a570040c1c195:0xb9142bc14799ee9c!8m2!3d-7.8147939!4d110.3282514!16s%2Fg%2F11w4b95199!19sChIJlcHBQABXei4RnO6ZR8ErFLk?authuser=0&hl=id&rclk=1,tata Florist,Toko Bunga,Jl. Sunan Kudus No.147,0819-9990-5332
https://www.google.com/maps/place/Mahesa+Buket/data=!4m7!3m6!1s0x2e7af913a21a4259:0xcc5e62a1bc64a1ac!8m2!3d-7.8000047!4d110.3245188!16s%2Fg%2F11w9kzm94y!19sChIJWUIaohP5ei4RrKFkvKFiXsw?authuser=0&hl=id&rclk=1,Mahesa Buket,Toko Bunga,Jl. Delingsari,0895-1941-2178
"https://www.google.com/maps/place/Anetta+Home,+Decor+%26+Floral+Bar/data=!4m7!3m6!1s0x2e7a57427ccd64b5:0xc8f6bbfbc467a925!8m2!3d-7.8042566!4d110.3509907!16s%2Fg%2F11l5dcxwcm!19sChIJtWTNfEJXei4RJalnxPu79sg?authuser=0&hl=id&rclk=1","Anetta Home, Decor & Floral Bar",Toko Bunga,Jl. Kapten Piere Tendean No.36a,0853-3332-2895
https://www.google.com/maps/place/Dreamyaul+Buket/data=!4m7!3m6!1s0x2e7af9892e38c7a7:0x5160f0e4297fff07!8m2!3d-7.8247042!4d110.3282811!16s%2Fg%2F11mdh8j7fs!19sChIJp8c4Lon5ei4RB_9_KeTwYFE?authuser=0&hl=id&rclk=1,Dreamyaul Buket,Toko Bunga,"Kasihan, RT.01/RW.Nomor Rumah",0856-4038-1573
"https://www.google.com/maps/place/TUKAMU+Florist,+Papan+Bunga,+%26+Gift/data=!4m7!3m6!1s0x2e7af9c27ce2105d:0x71d9a71cbf63c45e!8m2!3d-7.8017097!4d110.3197889!16s%2Fg%2F11v9qjgtnv!19sChIJXRDifML5ei4RXsRjvxyn2XE?authuser=0&hl=id&rclk=1","TUKAMU Florist, Papan Bunga, & Gift",Toko Bunga,Jl. Gn. Gamping,0822-2036-3024
https://www.google.com/maps/place/Toko+bunga+Naladhipa/data=!4m7!3m6!1s0x2e7af91b6793e6b1:0x883f2cd20a68413f!8m2!3d-7.815097!4d110.3259391!16s%2Fg%2F11vclj3xzw!19sChIJseaTZxv5ei4RP0FoCtIsP4g?authuser=0&hl=id&rclk=1,Toko bunga Naladhipa,Toko Bunga,Jl. Garuda,0858-4202-6072
https://www.google.com/maps/place/Pengambilan+Buket/data=!4m7!3m6!1s0x2e7af954aaf1b667:0x78f8970ebcdc622d!8m2!3d-7.8199493!4d110.3193629!16s%2Fg%2F11y31mf44l!19sChIJZ7bxqlT5ei4RLWLcvA6X-Hg?authuser=0&hl=id&rclk=1,Pengambilan Buket,Toko Bunga,Ngrame RT.02,0895-2299-0500
https://www.google.com/maps/place/Flowershop+Jogja+UMY/data=!4m7!3m6!1s0x2e7af90039fb8dff:0x64b96e1dc6ea7f8d!8m2!3d-7.8144135!4d110.3218754!16s%2Fg%2F11y3zw77sd!19sChIJ_437OQD5ei4RjX_qxh1uuWQ?authuser=0&hl=id&rclk=1,Flowershop Jogja UMY,Toko Bunga,"Jl. Rajawali No.125, Ngebel, Tamantirto, Kec. Kasihan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55183",0857-2744-5439
https://www.google.com/maps/place/Mawar+Florist+Yogyakarta/data=!4m7!3m6!1s0x2e7a582f07ee1297:0x2f3f8e9293022648!8m2!3d-7.7883866!4d110.3687488!16s%2Fg%2F1jky8qbbn!19sChIJlxLuBy9Yei4RSCYCk5KOPy8?authuser=0&hl=id&rclk=1,Mawar Florist Yogyakarta,Toko Bunga,·,0811-2927-662
https://www.google.com/maps/place/Talikerajinan.com/data=!4m7!3m6!1s0x2e7a5785f7237475:0x6060d94d12a248e2!8m2!3d-7.8044846!4d110.3534784!16s%2Fg%2F11sght135p!19sChIJdXQj94VXei4R4kiiEk3ZYGA?authuser=0&hl=id&rclk=1,Talikerajinan.com,Toko Kerajinan Tangan,Jl Werkudoro 108 RT035/RW007,0899-3607-080
https://www.google.com/maps/place/VS+KONVEKSI+%26+PASANG+WIFI+INDIHOME/data=!4m7!3m6!1s0x2e7a5941acce771d:0xf90036a750758be5!8m2!3d-7.7959504!4d110.3336289!16s%2Fg%2F11v5d8s6p0!19sChIJHXfOrEFZei4R5Yt1UKc2APk?authuser=0&hl=id&rclk=1,VS KONVEKSI & PASANG WIFI INDIHOME,Penjahit Pesanan Khusus,"Jl. H. Abdul Kahar No.RT 04, RT.04/RW.10",0851-7227-7872
https://www.google.com/maps/place/Buket+Snack+Dan+Bunga+Jogja+Fiora.id/data=!4m7!3m6!1s0x2e7a57520b9c2dbf:0x956e1c77f8f7151!8m2!3d-7.7989591!4d110.3905277!16s%2Fg%2F11h4_dsb5_!19sChIJvy2cC1JXei4RUXGPf8fhVgk?authuser=0&hl=id&rclk=1,Buket Snack Dan Bunga Jogja Fiora.id,Toko Bunga,Gg. Tj. VII Jl. Kenari No.317B,0896-1212-4441
https://www.google.com/maps/place/Rosenita_Florist/data=!4m7!3m6!1s0x2e7a5974b0e0ff7b:0x719ae520feb2673a!8m2!3d-7.787838!4d110.368569!16s%2Fg%2F11j_8pkftz!19sChIJe__gsHRZei4ROmey_iDlmnE?authuser=0&hl=id&rclk=1,Rosenita_Florist,Toko Bunga,Jl. Ahmad Jazuli No.45,0821-3729-1125
https://www.google.com/maps/place/TWANIS+GROSIR+KERTAS+KADO/data=!4m7!3m6!1s0x2e7a57883402dc89:0x20a4daa27b629a08!8m2!3d-7.7967756!4d110.3640028!16s%2Fg%2F1pzttlknx!19sChIJidwCNIhXei4RCJpie6LapCA?authuser=0&hl=id&rclk=1,TWANIS GROSIR KERTAS KADO,Toko Perlengkapan Kado,Jl. Beskalan Utara GM I No.443,0857-4347-6572
https://www.google.com/maps/place/Melati+Florist/data=!4m7!3m6!1s0x2e7a598447f9b839:0xd550e9b4cd94f317!8m2!3d-7.7885451!4d110.3692003!16s%2Fg%2F11s462r256!19sChIJObj5R4RZei4RF_OUzbTpUNU?authuser=0&hl=id&rclk=1,Melati Florist,Toko Bunga,"6969+HMP, Jl. Merbabu",0877-1991-4722
https://www.google.com/maps/place/Pak+Yo+Florist/data=!4m7!3m6!1s0x2e7a57d78810ba93:0xbc4431a4ec656c60!8m2!3d-7.8288256!4d110.3331815!16s%2Fg%2F11b7q10pyk!19sChIJk7oQiNdXei4RYGxl7KQxRLw?authuser=0&hl=id&rclk=1,Pak Yo Florist,Toko Bunga,Jl. Bibis Raya No.199,(0274) 384499
https://www.google.com/maps/place/Toko+Buket+Jogja+%28Alisha%29/data=!4m7!3m6!1s0x2e7a59dc3020698b:0x177520d2eb93d377!8m2!3d-7.7753979!4d110.3523708!16s%2Fg%2F11r9kkv4b2!19sChIJi2kgMNxZei4Rd9OT69IgdRc?authuser=0&hl=id&rclk=1,Toko Buket Jogja (Alisha),Toko,"Seberang Omah Pizza, Jl. Petak Baru No.9 A, RT.07/RW.02",0896-6205-5528
https://www.google.com/maps/place/Bunga+Bu+Ninik/data=!4m7!3m6!1s0x2e7a582fa4b39ffd:0x7b91e0cede48a33b!8m2!3d-7.7885998!4d110.3690976!16s%2Fg%2F11c3k96r0w!19sChIJ_Z-zpC9Yei4RO6NI3s7gkXs?authuser=0&hl=id&rclk=1,Bunga Bu Ninik,Toko Bunga,"Jl. Ahmad Jazuli No.19, RT.21/RW.04",0877-3851-5883
https://www.google.com/maps/place/Buket+Jogja+Anonim+Gift/data=!4m7!3m6!1s0x2e7af7e8bd5588fd:0x924d775c0a1fe071!8m2!3d-7.7679466!4d110.3262918!16s%2Fg%2F11l6f5yflw!19sChIJ_YhVvej3ei4RceAfClx3TZI?authuser=0&hl=id&rclk=1,Buket Jogja Anonim Gift,Toko Bunga,Jl. Makam,0822-2302-3114
https://www.google.com/maps/place/Evy+florist/data=!4m7!3m6!1s0x2e7a582fbb429beb:0xf4c98239f06f7f9a!8m2!3d-7.7882161!4d110.3686894!16s%2Fg%2F11bbx00kyb!19sChIJ65tCuy9Yei4Rmn9v8DmCyfQ?authuser=0&hl=id&rclk=1,Evy florist,Toko Bunga,Jl. Ahmad Jazuli No.35,0857-2899-9994
https://www.google.com/maps/place/Toko+karangan+bunga+jogja+%22Sekar+Dewi+Florist%22/data=!4m7!3m6!1s0x2e7a582fa4b419d1:0x9cb51f86c0222e02!8m2!3d-7.7878636!4d110.3685852!16s%2Fg%2F1hhgmc5bq!19sChIJ0Rm0pC9Yei4RAi4iwIYftZw?authuser=0&hl=id&rclk=1,"Toko karangan bunga jogja ""Sekar Dewi Florist""",Toko Bunga,Jl. Ahmad Jazuli No.49,0858-2190-0019
https://www.google.com/maps/place/Kebon+Bunga/data=!4m7!3m6!1s0x2e7a5826d5edd503:0xd775a0cb9cd49009!8m2!3d-7.7936007!4d110.3608759!16s%2Fg%2F1hm3vdbcw!19sChIJA9Xt1SZYei4RCZDUnMugddc?authuser=0&hl=id&rclk=1,Kebon Bunga,Toko Bunga,Jl. Kemetiran Kidul No.5,(0274) 563579
https://www.google.com/maps/place/Avis+Florist/data=!4m7!3m6!1s0x2e7a582f1aeb415f:0xd76cfb261106a068!8m2!3d-7.7888884!4d110.3689987!16s%2Fg%2F11b_020s0y!19sChIJX0HrGi9Yei4RaKAGESb7bNc?authuser=0&hl=id&rclk=1,Avis Florist,Toko Bunga,Jl. Ahmad Jazuli No.17,0812-9126-5168
https://www.google.com/maps/place/Gerai+Bunga/data=!4m7!3m6!1s0x2e7a5975e77505f9:0x8a69e2a4908e03b4!8m2!3d-7.7885446!4d110.3691957!16s%2Fg%2F11kx60dxds!19sChIJ-QV153VZei4RtAOOkKTiaYo?authuser=0&hl=id&rclk=1,Gerai Bunga,Toko Bunga,Jl. Merbabu,0822-6421-2220
https://www.google.com/maps/place/Kia_buket_towersnack/data=!4m7!3m6!1s0x2e7af95569130681:0x2a999f765c0b2b45!8m2!3d-7.8381485!4d110.3259966!16s%2Fg%2F11wbz9m_x2!19sChIJgQYTaVX5ei4RRSsLXHafmSo?authuser=0&hl=id&rclk=1,Kia_buket_towersnack,Desainer bunga,"Perum Puspa Indah Jl. Blk. J No.8, Rt 09",0895-4222-97520
https://www.google.com/maps/place/STAR+FLORIST+-+Yogya/data=!4m7!3m6!1s0x2e7a58656ac652ef:0x667afb7870ea0122!8m2!3d-7.7789903!4d110.355771!16s%2Fg%2F11hcj00wjm!19sChIJ71LGamVYei4RIgHqcHj7emY?authuser=0&hl=id&rclk=1,STAR FLORIST - Yogya,Toko Bunga,"Sidomulyo TR IV No.332, RT.18/RW.05",0877-3899-6908
https://www.google.com/maps/place/The+Bloomery+florist/data=!4m7!3m6!1s0x2e7a59007e4c4fe1:0x22d21303857258f9!8m2!3d-7.789075!4d110.36929!16s%2Fg%2F11wt_27mj9!19sChIJ4U9MfgBZei4R-VhyhQMT0iI?authuser=0&hl=id&rclk=1,The Bloomery florist,Toko Bunga,"Ahmad jajuli, Jl. Ahmad Jazuli No.gk 9",0852-9334-8522
https://www.google.com/maps/place/Toko+Bunga+Nanda+Florist/data=!4m7!3m6!1s0x2e7a593df1157dc3:0xa0946553728e325d!8m2!3d-7.7891429!4d110.3697466!16s%2Fg%2F11rzpmcbth!19sChIJw30V8T1Zei4RXTKOclNllKA?authuser=0&hl=id&rclk=1,Toko Bunga Nanda Florist,Toko Bunga,Jl. Ahmad Jazuli No.1,0857-2989-2259
https://www.google.com/maps/place/Toko+Bunga+Sakura/data=!4m7!3m6!1s0x2e7a582fa7396393:0x400a99b39dadf637!8m2!3d-7.7879534!4d110.3686363!16s%2Fg%2F1hm3th0vk!19sChIJk2M5py9Yei4RN_atnbOZCkA?authuser=0&hl=id&rclk=1,Toko Bunga Sakura,Toko Bunga,Jl. Ahmad Jazuli No.41,0895-4016-73012
https://www.google.com/maps/place/Luminara+Florist/data=!4m7!3m6!1s0x2e7a582fbb498b6b:0x488a84628395e372!8m2!3d-7.7875432!4d110.3683735!16s%2Fg%2F1tpx255x!19sChIJa4tJuy9Yei4RcuOVg2KEikg?authuser=0&hl=id&rclk=1,Luminara Florist,Toko Bunga,·,0877-0876-1005
https://www.google.com/maps/place/Gina+Florist/data=!4m7!3m6!1s0x2e7a582fa4b39ffd:0x7a50b26a26945451!8m2!3d-7.7885308!4d110.3692063!16s%2Fg%2F11dxns_pq7!19sChIJ_Z-zpC9Yei4RUVSUJmqyUHo?authuser=0&hl=id&rclk=1,Gina Florist,Toko Bunga,Jl. Merbabu,0899-4863-010
https://www.google.com/maps/place/Slempang+buket+jogja/data=!4m7!3m6!1s0x2e7a572e64a39419:0xefd02c79f5b0bdd7!8m2!3d-7.8076637!4d110.3859155!16s%2Fg%2F11qg9896wx!19sChIJGZSjZC5Xei4R172w9Xks0O8?authuser=0&hl=id&rclk=1,Slempang buket jogja,Kerajinan,"perum Gazebo B2, Jl. Persatuan Gg. Banowati",0873-9495-967
https://www.google.com/maps/place/Ayabi+Buket+Jogja/data=!4m7!3m6!1s0x2e7a5755861c0e1d:0x91fc8d3aa7a08969!8m2!3d-7.8080327!4d110.3898844!16s%2Fg%2F11l5jz6_sf!19sChIJHQ4chlVXei4RaYmgpzqN_JE?authuser=0&hl=id&rclk=1,Ayabi Buket Jogja,Toko Bunga,Jl. Prof. DR. Soepomo Sh No.68,0895-0445-3650
https://www.google.com/maps/place/Cloudsy+Buket+Jogja/data=!4m7!3m6!1s0x2e7a5700444bd739:0xd5117247d8d5ce08!8m2!3d-7.8156233!4d110.4043948!16s%2Fg%2F11ld547504!19sChIJOddLRABXei4RCM7V2EdyEdU?authuser=0&hl=id&rclk=1,Cloudsy Buket Jogja,Toko Bunga,Gg. Gading,0859-5634-1456
https://www.google.com/maps/place/Flosa+Florist+UAD/data=!4m7!3m6!1s0x2e7a571233839f01:0x59fcff410f1b49d6!8m2!3d-7.8286071!4d110.3797046!16s%2Fg%2F11kqcfh662!19sChIJAZ-DMxJXei4R1kkbD0H__Fk?authuser=0&hl=id&rclk=1,Flosa Florist UAD,Toko Bunga,Jl. Ki Ageng Pemanahan No.48,0813-2393-8898
https://www.google.com/maps/place/Kios+Bunga+Pusaka+Florist/data=!4m7!3m6!1s0x2e7a582f08b3e6cb:0xc02a313b2a340a7d!8m2!3d-7.7885314!4d110.3687726!16s%2Fg%2F11bbx0j6f6!19sChIJy-azCC9Yei4RfQo0KjsxKsA?authuser=0&hl=id&rclk=1,Kios Bunga Pusaka Florist,Toko Bunga,Jl. Ahmad Jazuli No.27,(0274) 565689
https://www.google.com/maps/place/Toko+Bunga+Jogja+Sekar+Arum/data=!4m7!3m6!1s0x2e7a577012f54b83:0x2036374b3cf89026!8m2!3d-7.8064018!4d110.3879596!16s%2Fg%2F11b6czc2m3!19sChIJg0v1EnBXei4RJpD4PEs3NiA?authuser=0&hl=id&rclk=1,Toko Bunga Jogja Sekar Arum,Toko Bunga,Jl. Glagahsari No.64,0881-2466-909
https://www.google.com/maps/place/Buket+Jogja+Zoya/data=!4m7!3m6!1s0x2e7a57512dc8cf81:0x98f42b078683481d!8m2!3d-7.8332097!4d110.3811357!16s%2Fg%2F11v3hwf0r2!19sChIJgc_ILVFXei4RHUiDhgcr9Jg?authuser=0&hl=id&rclk=1,Buket Jogja Zoya,Toko Bunga,Jl. Ki Ageng Pemanahan,0889-8528-9792
https://www.google.com/maps/place/Karangan+Bunga+Papan+TOKO+BUNGA+AGUNG+JOGJA/data=!4m7!3m6!1s0x2e7a59c2a4a76847:0x35146eb1b40a9cb6!8m2!3d-7.7876702!4d110.368496!16s%2Fg%2F11s0wyt2_k!19sChIJR2inpMJZei4RtpwKtLFuFDU?authuser=0&hl=id&rclk=1,Karangan Bunga Papan TOKO BUNGA AGUNG JOGJA,Toko Bunga,Jl. Ahmad Jazuli No.53,0813-2758-4400
https://www.google.com/maps/place/Immortelle+Florist/data=!4m7!3m6!1s0x2e7a57e1d42e21ed:0x7408b2ccf9aca91d!8m2!3d-7.8353277!4d110.3434604!16s%2Fg%2F11fsx23lnk!19sChIJ7IEu1OFXei4RHams-cyyCHQ?authuser=0&hl=id&rclk=1,Immortelle Florist,Toko Bunga,Jl. Mrisi No.11,0821-3429-2009
https://www.google.com/maps/place/Buket+Snack+dan+Bunga+%22Bouquet+Jogja%22/data=!4m7!3m6!1s0x2e7a595ef0ec6c79:0x7a5b88a00fe4509f!8m2!3d-7.7716978!4d110.3712128!16s%2Fg%2F11wty21mfx!19sChIJeWzs8F5Zei4Rn1DkD6CIW3o?authuser=0&hl=id&rclk=1,"Buket Snack dan Bunga ""Bouquet Jogja""",Toko Bunga,"Sendowo E 99, RW.007/055",0838-3611-5959
https://www.google.com/maps/place/Toko+Bunga+Bu+Amad/data=!4m7!3m6!1s0x2e7a582fa6ba8599:0xcf1cdbfc89c35bcf!8m2!3d-7.7877723!4d110.3685544!16s%2Fg%2F11bbw_x273!19sChIJmYW6pi9Yei4Rz1vDifzbHM8?authuser=0&hl=id&rclk=1,Toko Bunga Bu Amad,Toko Bunga,Jl. Ahmad Jazuli No.47,0817-4118-253
https://www.google.com/maps/place/Buket+jogja/data=!4m7!3m6!1s0x2e7af7f4b745fda1:0xfe21771b5f3ad0aa!8m2!3d-7.7688009!4d110.3244982!16s%2Fg%2F11p5hqz74w!19sChIJof1Ft_T3ei4RqtA6Xxt3If4?authuser=0&hl=id&rclk=1,Buket jogja,Toko Suvenir,Gg. Sadewa II,0838-6706-5134
https://www.google.com/maps/place/Nanapink+Florist+%28%EA%A6%A4%EA%A6%A4%EA%A6%A5%EA%A6%B6%EA%A6%A4%EA%A7%80%EA%A6%8F%EA%A6%A5%EA%A6%B3%EA%A7%80%EA%A6%AD%EA%A6%B4%EA%A6%AB%EA%A6%B6%EA%A6%B1%EA%A7%80%EA%A6%00%29/data=!4m7!3m6!1s0x2e7a5938f294586d:0x22b05a3da86f0527!8m2!3d-7.7886175!4d110.368846!16s%2Fg%2F11rwrwbg6d!19sChIJbViU8jhZei4RJwVvqD1asCI?authuser=0&hl=id&rclk=1,Nanapink Florist (ꦤꦤꦥꦶꦤ꧀ꦏꦥ꦳꧀ꦭꦴꦫꦶꦱ꧀ꦠ),Toko Bunga,Jl. Ahmad Jazuli No.21,0898-8453-326
https://www.google.com/maps/place/BALON+BUNGAKU+FLORIST/data=!4m7!3m6!1s0x2e7a579cb599efc9:0x75c748e911cfb372!8m2!3d-7.8424868!4d110.334612!16s%2Fg%2F11lc_9wy8y!19sChIJye-ZtZxXei4RcrPPEelIx3U?authuser=0&hl=id&rclk=1,BALON BUNGAKU FLORIST,Toko Bunga,Goren No.RT. 02,0878-7723-3712
https://www.google.com/maps/place/Rona+Bloom+x+Bouquet+by+Uswah/data=!4m7!3m6!1s0x2e7a59359c43d175:0x6e038ea410d9a68c!8m2!3d-7.7787843!4d110.3711123!16s%2Fg%2F11svpc2v3x!19sChIJddFDnDVZei4RjKbZEKSOA24?authuser=0&hl=id&rclk=1,Rona Bloom x Bouquet by Uswah,Toko Bunga,Gg. Mayangkoro,0831-0607-0472
https://www.google.com/maps/place/Buket+Ashadira+Warungboto+Jogja/data=!4m7!3m6!1s0x2e7a57c8ff82ed11:0xd0ca207d54689d07!8m2!3d-7.8107399!4d110.389769!16s%2Fg%2F11vm68ql3h!19sChIJEe2C_8hXei4RB51oVH0gytA?authuser=0&hl=id&rclk=1,Buket Ashadira Warungboto Jogja,Toko Bunga,"Jln. Prof. Dr. Soepomo No.647, Jl. Prof. DR. Soepomo Sh No.647",0822-2690-3772
https://www.google.com/maps/place/Toko+Bunga+Daryono/data=!4m7!3m6!1s0x2e7a582fbc11582b:0x572d8e6672571a21!8m2!3d-7.7874108!4d110.3685366!16s%2Fg%2F1hm5nw1mr!19sChIJK1gRvC9Yei4RIRpXcmaOLVc?authuser=0&hl=id&rclk=1,Toko Bunga Daryono,Toko Bunga,Jl. Ahmad Jazuli No.63,0852-2503-9990
https://www.google.com/maps/place/Dewi+Florist/data=!4m7!3m6!1s0x2e7a582f08a0fc81:0xaafde0bd505e61c7!8m2!3d-7.7891003!4d110.3692587!16s%2Fg%2F11b7k5ltvd!19sChIJgfygCC9Yei4Rx2FeUL3g_ao?authuser=0&hl=id&rclk=1,Dewi Florist,Toko Bunga,Jl. Ahmad Jazuli No.9,0821-3476-0496
https://www.google.com/maps/place/1S+Buket+Jogja+-+Toko+Bunga+-+Florist+Jogja/data=!4m7!3m6!1s0x2e7a5900486a4da1:0x736900579e7151be!8m2!3d-7.7681595!4d110.3882173!16s%2Fg%2F11xt4lrhm8!19sChIJoU1qSABZei4RvlFxnlcAaXM?authuser=0&hl=id&rclk=1,1S Buket Jogja - Toko Bunga - Florist Jogja,Toko Bunga,Gg. Anyelir No.CTX.09,0813-1197-766
https://www.google.com/maps/place/Toko+bunga+Kalalili+%7C+Toko+Bunga+Kotabaru+%7C+Kalalili+Florist+%7C+Buket+Bunga+Kotabaru+%7C+Bunga+Papan/data=!4m7!3m6!1s0x2e7a5967d1ab4105:0xd2321c9db1123fde!8m2!3d-7.787973!4d110.368582!16s%2Fg%2F11y45v4jny!19sChIJBUGr0WdZei4R3j8SsZ0cMtI?authuser=0&hl=id&rclk=1,Toko bunga Kalalili | Toko Bunga Kotabaru | Kalalili Florist | Buket Bunga Kotabaru | Bunga Papan,Toko Bunga,Jl. Ahmad Jazuli No.41,0895-2626-4469
https://www.google.com/maps/place/Kios+Bunga+Pak+Adib/data=!4m7!3m6!1s0x2e7a582fa4b39ffd:0x5e44f084e7ec4de5!8m2!3d-7.7891927!4d110.3694324!16s%2Fg%2F11c52n__d3!19sChIJ_Z-zpC9Yei4R5U3s54TwRF4?authuser=0&hl=id&rclk=1,Kios Bunga Pak Adib,Toko Bunga,"6969+8QF, Jl. Ahmad Jazuli",0856-4327-5186
https://www.google.com/maps/place/Hillary/data=!4m7!3m6!1s0x2e7a5813bf996635:0x1fcbcee01211df34!8m2!3d-7.7801991!4d110.3471088!16s%2Fg%2F1pzsx9_jp!19sChIJNWaZvxNYei4RNN8REuDOyx8?authuser=0&hl=id&rclk=1,Hillary,Toko Bunga,Jl. Ngapak - Kentheng No.Km. 8,(0274) 7459996
https://www.google.com/maps/place/Buket+Kunisa+Jogja/data=!4m7!3m6!1s0x2e7a59c4052eb2cb:0xdd38d6555e9e830a!8m2!3d-7.778651!4d110.3954892!16s%2Fg%2F11f3zzy27q!19sChIJy7IuBcRZei4RCoOeXlXWON0?authuser=0&hl=id&rclk=1,Buket Kunisa Jogja,Toko Bunga,Jl. Tutul No.2,0815-4842-9534
"https://www.google.com/maps/place/TALA+HOUSE+STORE+%28TOKO+LILIN+AROMATERAPI+%2F+SCENTED+CANDLES,+CONCRETE,+SOUVENIR,+HAMPERS,+BUKET+BUNGA,+BUKET+SNACK,+PARCEL%29/data=!4m7!3m6!1s0x2e7af9818dcf8d55:0x6ca2663ff2829f54!8m2!3d-7.8340846!4d110.3133062!16s%2Fg%2F11pyc38br4!19sChIJVY3PjYH5ei4RVJ-C8j9momw?authuser=0&hl=id&rclk=1","TALA HOUSE STORE (TOKO LILIN AROMATERAPI / SCENTED CANDLES, CONCRETE, SOUVENIR, HAMPERS, BUKET BUNGA, BUKET SNACK, PARCEL)",Toko Kerajinan Tangan,Jl. Bibis No.Rt 03,0877-4238-7015
https://www.google.com/maps/place/Toko+Bunga+Yuni/data=!4m7!3m6!1s0x2e7a582fa34ba38d:0xe903f7ad4f0eb979!8m2!3d-7.7873034!4d110.3684688!16s%2Fg%2F11bbx1bgmn!19sChIJjaNLoy9Yei4RebkOT633A-k?authuser=0&hl=id&rclk=1,Toko Bunga Yuni,Toko Bunga,Jl. Ahmad Jazuli No.65,0819-0411-6442
"https://www.google.com/maps/place/Papabouquet+UGM+%26+UNY+-+Florist,+Papan+Bunga+%26+Hampers+Jogja/data=!4m7!3m6!1s0x2e7a5785ed4c787b:0x24d6c1c3eea7b1ab!8m2!3d-7.7680182!4d110.3879438!16s%2Fg%2F11lqdns6l9!19sChIJe3hM7YVXei4Rq7Gn7sPB1iQ?authuser=0&hl=id&rclk=1","Papabouquet UGM & UNY - Florist, Papan Bunga & Hampers Jogja",Toko Bunga,"CT X, Gg. Anyelir No.11",0821-3792-7035
https://www.google.com/maps/place/Glow+Florist/data=!4m7!3m6!1s0x2e7a59dd7fb766db:0xf6315d49ec60da85!8m2!3d-7.7660874!4d110.3575009!16s%2Fg%2F11ls0c9b_6!19sChIJ22a3f91Zei4Rhdpg7EldMfY?authuser=0&hl=id&rclk=1,Glow Florist,Toko Bunga,Jl. Wisanggeni No.88,0877-6060-8811
https://www.google.com/maps/place/Toko+Bunga+Sudirham/data=!4m7!3m6!1s0x2e7a582fa3718e13:0xa887c39d1bd1682e!8m2!3d-7.7874459!4d110.3684967!16s%2Fg%2F1hm3pc62b!19sChIJE45xoy9Yei4RLmjRG53Dh6g?authuser=0&hl=id&rclk=1,Toko Bunga Sudirham,Toko Bunga,Jl. Ahmad Jazuli No.61,0878-3939-3985
https://www.google.com/maps/place/Toko+bunga+Godean+Parikesit+floris/data=!4m7!3m6!1s0x2e7af73e7296b987:0x80793e9bd1af4c64!8m2!3d-7.7696839!4d110.3016785!16s%2Fg%2F11rydpmxm1!19sChIJh7mWcj73ei4RZEyv0Zs-eYA?authuser=0&hl=id&rclk=1,Toko bunga Godean Parikesit floris,Toko Bunga,Jl. Ngapak - Kentheng No.Km.9,0882-0069-46413
https://www.google.com/maps/place/Toko+Bunga+Tulip/data=!4m7!3m6!1s0x2e7a582f08c77e05:0x4399c1b56cb2bc74!8m2!3d-7.7884569!4d110.368769!16s%2Fg%2F11bbx1ln6t!19sChIJBX7HCC9Yei4RdLyybLXBmUM?authuser=0&hl=id&rclk=1,Toko Bunga Tulip,Toko Bunga,Jl. Ahmad Jazuli No.31,0878-3832-0195
https://www.google.com/maps/place/CF+papan+bunga+jogja/data=!4m7!3m6!1s0x2e7a596e7e11066b:0x4a4adf26b1efcf8!8m2!3d-7.7838949!4d110.3481075!16s%2Fg%2F11hz19npsw!19sChIJawYRfm5Zei4R-Pwea_KtpAQ?authuser=0&hl=id&rclk=1,CF papan bunga jogja,Toko Bunga,Jl. Sumberan Baru No.254,0812-2077-5335
`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export interface DummyStore {
  id: string;
  name: string;
  category: string;
  phone: string;
  isVerified: boolean;
  isDummy: boolean;
  rating: number;
  reviewCount: number;
  operatingHours: string;
  owner: string;
  email: string;
  bannerUrl: string;
  logoUrl: string;
  themeColor: string;
  themePattern: string;
  description: string;
  isFeatured: boolean;
  activeAdPkg: any | null;
  location: {
    lat: number;
    lng: number;
    address: string;
    gmapLink: string;
  };
}

export const DUMMY_STORES: DummyStore[] = (() => {
  const lines = RAW_STORES_DATA.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const stores: DummyStore[] = [];

  lines.forEach((line, index) => {
    try {
      const parts = parseCSVLine(line);
      if (parts.length < 4) return;

      const gmapLink = parts[0];
      const name = parts[1];
      const category = parts[2];
      const address = parts[3];
      const phone = parts[4] || "";

      // Extract coordinates from gmapLink using regex
      // matches e.g. !3d-7.807951!4d110.3374451
      const coordMatch = gmapLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      let lat = -7.797061; // fallback Kotabaru / Malioboro area coords
      let lng = 110.368554;
      if (coordMatch) {
         lat = parseFloat(coordMatch[1]);
         lng = parseFloat(coordMatch[2]);
      } else {
         // fallback based on index to spread them around Jogja Kotabaru if somehow parsing fails
         lat = -7.788 + (index * 0.0005) * (index % 2 === 0 ? 1 : -1);
         lng = 110.368 + (index * 0.0005) * (index % 3 === 0 ? 1 : -1);
      }

      // Consistent randomized fields (based on index)
      const rating = parseFloat((4.5 + (index % 6) * 0.1).toFixed(1));
      const reviewCount = 12 + (index * 7) % 180;
      const hours = (index % 3 === 0) ? "08:00 - 21:00" : (index % 3 === 1 ? "09:00 - 22:00" : "07:30 - 20:00");
      
      const cleanName = name.replace(/['"]+/g, "");
      const cleanAddress = address.replace(/['"]+/g, "");
      const cleanPhone = phone.replace(/['"]+/g, "").trim();

      const id = `dummy-store-${index + 1}`;
      
      // Make them look beautifully customized too
      const gradients = [
        "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
        "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
        "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        "linear-gradient(135deg, #f5f3ff 0%, #edd9ff 100%)"
      ];
      const colors = ["#ec4899", "#06b6d4", "#22c55e", "#f97316", "#8b5cf6"];
      const patterns = ["dots", "grid", "stripes", "waves", "none"];

      stores.push({
        id,
        name: cleanName,
        category: category,
        phone: cleanPhone,
        isVerified: true,
        isDummy: true,
        rating,
        reviewCount,
        operatingHours: hours,
        owner: cleanName.split(" ")[0] || "Florist Partner",
        email: `partner-${index + 1}@titikkembang.id`,
        bannerUrl: "",
        logoUrl: "",
        themeColor: colors[index % colors.length],
        themePattern: patterns[index % patterns.length],
        description: `Halo kak! Kami ${cleanName} siap menyajikan kriya buket kawat bulu pipa pembersih premium, buket bunga segar/kering, balon wisuda, serta hampers custom estetik untuk kado yang mengesankan! Silakan koordinasi lewat WA ya.`,
        isFeatured: false,
        activeAdPkg: null,
        location: {
          lat,
          lng,
          address: cleanAddress,
          gmapLink: gmapLink.replace(/['"]+/g, "")
        }
      });
    } catch (e) {
      console.warn("Parse error for line: ", line, e);
    }
  });

  return stores;
})();

export const DUMMY_PRODUCTS_PRESETS = [
  {
    name: "Classic Rose Woolen Bouquet 🌹",
    price: 45000,
    category: "Buket Bunga",
    description: "Buket buket bunga mawar merah merah romantis berbahan kawat bulu pipa pembersih (chenille stems) berkualitas tinggi. Awet selamanya, anti layu, dikemas cantik eksklusif.",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600",
    inventory: 99,
  },
  {
    name: "Cheerful Sunflower Chenille Bouquet 🌻",
    price: 55000,
    category: "Buket Bunga",
    description: "Buket bunga matahari kawat bulu yang membawa kehangatan dan rasa ceria. Sempurna untuk kado wisuda kelulusan atau perayaan ulang tahun sahabat.",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600",
    inventory: 99,
  },
  {
    name: "Snack Bouquet Silverqueen Special 🍫",
    price: 35000,
    category: "Buket Snack",
    description: "Buket snack coklat Silverqueen lezat dihiasi aksen kawat bulu mini lucu. Sangat direkomendasikan untuk hadiah sidang skripsi atau anniversary manis.",
    image: "https://images.unsplash.com/photo-1549007994-cb92ca8a3a27?auto=format&fit=crop&q=80&w=600",
    inventory: 99,
  },
  {
    name: "Premium Balloon Flower Basket Jogja 🎈",
    price: 85000,
    category: "Hampers & Kado",
    description: "Keranjang kado eksklusif yang memadukan balon udara mini bening berisi bunga kawat bulu kustom didalamnya. Elok dipajang di meja kerja atau kamar pacar.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
    inventory: 15,
  }
];

export function getDummyProductsForStore(storeId: string) {
  // Generate consistent randomized prices and products for each dummy store to make them clickable
  const seed = storeId.split("-").pop() || "1";
  const numSeed = parseInt(seed) || 1;

  return DUMMY_PRODUCTS_PRESETS.map((p, idx) => {
    const customPrice = p.price + ((numSeed * (idx + 1) * 2000) % 15000) - 5000;
    return {
      id: `dummy-prod-${storeId}-${idx + 1}`,
      storeId: storeId,
      name: p.name,
      price: Math.max(25000, Math.round(customPrice / 1000) * 1000),
      category: p.category,
      description: `Disajikan khusus oleh mitra kriya lokal. ${p.description}`,
      image: p.image,
      images: [p.image],
      inventory: (numSeed + idx) % 5 === 0 ? 0 : 99, // mix some ready-stock or preorder-only items
      isFeatured: idx === 0,
    };
  });
}
