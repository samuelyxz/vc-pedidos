import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ShoppingCart, Users, Package, Settings, ClipboardList, Plus, Trash2, Search, Download, Upload, X, AlertCircle, ChevronRight, RefreshCw, FileCheck2 } from 'lucide-react';

const DEFAULT_PRODUCTS = [{"codigo":"80.822.0003","sap":"2156207027","ean":"7898205922998","categoria":"CREME","subcategoria":"CR LEITE","linha":"GARRAFA","secao":"CREMES 500G","status":"","nome":"CREME DE LEITE LACFREE 500G","descricao_original":"CREME DE LEITE LACFREE VC 500G CX 12","un_cx":12,"preco_st":309.14,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/08/37390-MOCKUP-NR-LACFREE-CREME-DE-LEITE_AF01.png"},{"codigo":"80.822.0002","sap":"2156173027","ean":"7898205920222","categoria":"CREME","subcategoria":"CR LEITE","linha":"GARRAFA","secao":"CREMES 500G","status":"","nome":"CREME DE LEITE TRAD 500G","descricao_original":"CREME DE LEITE TRAD VC 500G CX 12","un_cx":12,"preco_st":288.49,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/08/37390-MOCKUP-NR-LACFREE-CREME-DE-LEITE_AF01.png"},{"codigo":"80.884.0004","sap":"","ean":"7898205925753","categoria":"IOGURTE","subcategoria":"A2","linha":"A2","secao":"IOG A2 INTEGRAL 500G","status":"LANÇAMENTO","nome":"IOG A2 INTEGRAL 2 INGR 500G","descricao_original":"IOG A2 INTEGRAL 2 INGR 500G VC CX 12","un_cx":12,"preco_st":123.08,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.884.0005","sap":"","ean":"7898205925814","categoria":"IOGURTE","subcategoria":"A2","linha":"A2","secao":"IOG A2 INTEGRAL 500G","status":"LANÇAMENTO","nome":"IOG A2 INTEGRAL MEL 500G","descricao_original":"IOG A2 INTEGRAL MEL 500G VC CX 12","un_cx":12,"preco_st":123.08,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.884.0006","sap":"","ean":"7898205925890","categoria":"IOGURTE","subcategoria":"A2","linha":"A2","secao":"IOG A2 INTEGRAL 500G","status":"LANÇAMENTO","nome":"IOG A2 INTEGRAL MORANGO 500G","descricao_original":"IOG A2 INTEGRAL MORANGO 500G VC CX 12","un_cx":12,"preco_st":123.08,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.883.0005","sap":"","ean":"7898205925883","categoria":"IOGURTE","subcategoria":"TRADICIONAL","linha":"TRADICIONAL 170G","secao":"IOG TRADICIONAL BATIDO 500G","status":"LANÇAMENTO","nome":"IOG TRADICIONAL BATIDO 170G","descricao_original":"IOG TRADICIONAL BATIDO 170G VC CX 12","un_cx":12,"preco_st":34.23,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37400-MOCKUP-NR-LACFREE-IOGURTE-NATURAL-170G_AF02-removebg-preview.png"},{"codigo":"80.883.0007","sap":"","ean":"7898205925852","categoria":"IOGURTE","subcategoria":"TRADICIONAL","linha":"TRADICIONAL 500G","secao":"IOG TRADICIONAL BATIDO 500G","status":"LANÇAMENTO","nome":"IOG TRADICIONAL BATIDO 500G","descricao_original":"IOG TRADICIONAL BATIDO 500G VC CX 12","un_cx":12,"preco_st":87.27,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37433-MOCKUP-NR-LACFREE-IOGURTE-SABOR-TRADICIONAL-500G_AF01.png"},{"codigo":"80.883.0004","sap":"","ean":"7898205925906","categoria":"IOGURTE","subcategoria":"TRADICIONAL","linha":"TRADICIONAL 170G","secao":"IOG TRADICIONAL MORANGO","status":"LANÇAMENTO","nome":"IOG TRADICIONAL MORANGO 170G","descricao_original":"IOG TRADICIONAL MORANGO 170G VC CX 12","un_cx":12,"preco_st":34.23,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37340-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-170G_AF01.png"},{"codigo":"80.883.0006","sap":"","ean":"7898205925869","categoria":"IOGURTE","subcategoria":"TRADICIONAL","linha":"TRADICIONAL 500G","secao":"IOG TRADICIONAL MORANGO","status":"LANÇAMENTO","nome":"IOG TRADICIONAL MORANGO 500G","descricao_original":"IOG TRADICIONAL MORANGO 500G VC CX 12","un_cx":12,"preco_st":87.27,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37555-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-500G_AF01.png"},{"codigo":"80.884.0001","sap":"2157223172","ean":"7898205925449","categoria":"IOGURTE","subcategoria":"NATURAL","linha":"NATURAL","secao":"IOGURTE DESNATADO NATURAL","status":"","nome":"IOG DESNATADO NATURAL 140G","descricao_original":"IOG DESNATADO NATURAL VC 140G CX 12","un_cx":12,"preco_st":38.97,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.882.0019","sap":"2157273257","ean":"7898205925609","categoria":"IOGURTE","subcategoria":"NATURAL","linha":"DESNATADO","secao":"IOGURTES DESN 2 INGR","status":"","nome":"IOG DESN 2 INGR LACFREE 160G","descricao_original":"IOG DESN 2 INGR LACFREE 160G VC CX 24","un_cx":24,"preco_st":79.46,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/09/41434-MOCKUP-2-INGREDIENTES-INTEGRAL-160G-LACFREE_AF02.png"},{"codigo":"80.882.0020","sap":"2157274257","ean":"7898205925593","categoria":"IOGURTE","subcategoria":"NATURAL","linha":"DESNATADO","secao":"IOGURTES DESN 2 INGR","status":"","nome":"IOG DESN 2 INGR LACFREE 480G","descricao_original":"IOG DESN 2 INGR LACFREE 480G VC CX 12","un_cx":12,"preco_st":110.13,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/03/41411-MOCKUP-2-INGREDIENTES-INTEGRAL-480ML-LACFREE_AF02.png"},{"codigo":"80.884.0002","sap":"2157273027","ean":"7898205925579","categoria":"IOGURTE","subcategoria":"NATURAL","linha":"INTEGRAL","secao":"IOGURTES INTEGRAL 2 INGR","status":"","nome":"IOG INTEGRAL 2 INGR 160G","descricao_original":"IOG INTEGRAL 2 INGR 160G VC CX 24","un_cx":24,"preco_st":79.46,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/09/41434-MOCKUP-2-INGREDIENTES-INTEGRAL-160G-LACFREE_AF02.png"},{"codigo":"80.884.0003","sap":"2157274027","ean":"7898205925586","categoria":"IOGURTE","subcategoria":"NATURAL","linha":"INTEGRAL","secao":"IOGURTES INTEGRAL 2 INGR","status":"","nome":"IOG INTEGRAL 2 INGR 480G","descricao_original":"IOG INTEGRAL 2 INGR 480G VC CX 12","un_cx":12,"preco_st":110.13,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/03/41411-MOCKUP-2-INGREDIENTES-INTEGRAL-480ML-LACFREE_AF02.png"},{"codigo":"80.761.0001","sap":"2161207006","ean":"7898205925623","categoria":"IOGURTE","subcategoria":"KEFIR","linha":"KEFIR","secao":"IOGURTES KEFIR 500G","status":"","nome":"KEFIR LACFREE MORANGO 500G","descricao_original":"KEFIR LACFREE MORANGO 500G VC CX 12","un_cx":12,"preco_st":129.13,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/03/thumbnail_41405-MOCKUP-KEFIR-MORANGO-500ML-TK6.png"},{"codigo":"80.761.0002","sap":"2161207027","ean":"7898205925616","categoria":"IOGURTE","subcategoria":"KEFIR","linha":"KEFIR","secao":"IOGURTES KEFIR 500G","status":"","nome":"KEFIR LACFREE TRADICIONAL 500G","descricao_original":"KEFIR LACFREE TRADICIONAL 500G VC CX 12","un_cx":12,"preco_st":129.13,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/03/thumbnail_41403-MOCKUP-KEFIR-NATURAL-500ML-TK11.png"},{"codigo":"80.882.0002","sap":"2157223163","ean":"7898205924060","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 140G","secao":"IOGURTES LACFREE 140G (CAIXA COM 12 UNIDADES)","status":"","nome":"IOG LACFREE BMM 140G","descricao_original":"IOG LACFREE BMM VC 140G CX 12","un_cx":12,"preco_st":46.58,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37429-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-140G_AF01.png"},{"codigo":"80.882.0010","sap":"2157223006","ean":"7898205923919","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 140G","secao":"IOGURTES LACFREE 140G (CAIXA COM 12 UNIDADES)","status":"","nome":"IOG LACFREE MORANGO 140G","descricao_original":"IOG LACFREE MORANGO VC 140G CX 12","un_cx":12,"preco_st":46.58,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37429-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-140G_AF01.png"},{"codigo":"80.882.0015","sap":"2157223027","ean":"7898205923902","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 140G","secao":"IOGURTES LACFREE 140G (CAIXA COM 12 UNIDADES)","status":"","nome":"IOG LACFREE TRADICIONAL 140G","descricao_original":"IOG LACFREE TRADICIONAL VC 140G CX 12","un_cx":12,"preco_st":46.58,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37842-MOCKUP-NR-LACFREE-IOGURTE-NATURAL-SABOR-TRADICIONAL-140G_AF01.png"},{"codigo":"80.882.0004","sap":"2157176163","ean":"7898205924466","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 170G","secao":"IOGURTES LACFREE 170G","status":"","nome":"IOG LACFREE BMM 170G","descricao_original":"IOG LACFREE BMM VC 170G CX 12","un_cx":12,"preco_st":48.4,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37340-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-170G_AF01.png"},{"codigo":"80.882.0012","sap":"2157176167","ean":"7898205924480","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 170G","secao":"IOGURTES LACFREE 170G","status":"","nome":"IOG LACFREE MORANGO 170G","descricao_original":"IOG LACFREE MORANGO VC 170G CX 12","un_cx":12,"preco_st":48.4,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37340-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-170G_AF01.png"},{"codigo":"80.882.0017","sap":"2157176027","ean":"7898205924497","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 170G","secao":"IOGURTES LACFREE 170G","status":"","nome":"IOG LACFREE TRADICIONAL 170G","descricao_original":"IOG LACFREE TRADICIONAL VC 170G CX 12","un_cx":12,"preco_st":48.4,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37400-MOCKUP-NR-LACFREE-IOGURTE-NATURAL-170G_AF02-removebg-preview.png"},{"codigo":"80.882.0001","sap":"2157173171","ean":"7898205923827","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE AMEIXA 500G","descricao_original":"IOG LACFREE AMEIXA VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37876-MOCKUP-NR-LACFREE-IOGURTE-AMEIXA-500G_AF01.png"},{"codigo":"80.882.0005","sap":"2157173163","ean":"7898205923940","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE BMM 500G","descricao_original":"IOG LACFREE BMM VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37555-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-500G_AF01.png"},{"codigo":"80.882.0006","sap":"2157173232","ean":"7898205925180","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE COCO 500G","descricao_original":"IOG LACFREE COCO VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/06/Imagem-do-WhatsApp-de-2023-10-10-às-16.18.04_e7ed8e1e-removebg-preview.png"},{"codigo":"80.882.0009","sap":"2157173166","ean":"7898205924305","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE GOJIBERRY 500G","descricao_original":"IOG LACFREE GOJIBERRY VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37431-MOCKUP-NR-LACFREE-IOGURTE-CRANBERRY-E-GOJIBERRY-500G_AF01.png"},{"codigo":"80.882.0013","sap":"2157173006","ean":"7898205923650","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE MORANGO 500G","descricao_original":"IOG LACFREE MORANGO VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37555-MOCKUP-NR-LACFREE-IOGURTE-MORANGO-500G_AF01.png"},{"codigo":"80.882.0014","sap":"2157173172","ean":"7898205923988","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE S/ADOC NATURAL 500G","descricao_original":"IOG LACFREE S/ADOC NATURAL VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37398-MOCKUP-NR-LACFREE-IOGURTE-NATURAL-SEM-ACUCAR-500G_AF01.png"},{"codigo":"80.882.0018","sap":"2157207027","ean":"7898205923643","categoria":"IOGURTE","subcategoria":"LACFREE","linha":"LACFREE 500G","secao":"IOGURTES LACFREE 500G","status":"","nome":"IOG LACFREE TRADICIONAL 500G","descricao_original":"IOG LACFREE TRADICIONAL VC 500G CX 12","un_cx":12,"preco_st":117.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37433-MOCKUP-NR-LACFREE-IOGURTE-SABOR-TRADICIONAL-500G_AF01.png"},{"codigo":"80.878.0002","sap":"2157223268","ean":"7898205925555","categoria":"WHEY IOGURTE","subcategoria":"WHEY COLHERÁVEL","linha":"WHEY COLHERÁVEL","secao":"IOGURTES NATURAL WHEY 140G","status":"","nome":"IOG WHEY 11 ABAC E COCO 140G","descricao_original":"IOG WHEY 11 ABAC E COCO 140G VC CX 12","un_cx":12,"preco_st":84.73,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/08/Mockup_INW02_NaturalWhey_AbacaxiCoco-1.png"},{"codigo":"80.878.0004","sap":"2157223133","ean":"7898205925562","categoria":"WHEY IOGURTE","subcategoria":"WHEY COLHERÁVEL","linha":"WHEY COLHERÁVEL","secao":"IOGURTES NATURAL WHEY 140G","status":"","nome":"IOG WHEY 11 BANANA E CANELA 140G","descricao_original":"IOG WHEY 11 BANANA E CANELA 140G VC CX 12","un_cx":12,"preco_st":84.73,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/08/Mockup_INW17_NaturalWhey_BananaCanela-1.png"},{"codigo":"80.878.0005","sap":"2157223019","ean":"7898205925395","categoria":"WHEY IOGURTE","subcategoria":"WHEY COLHERÁVEL","linha":"WHEY COLHERÁVEL","secao":"IOGURTES NATURAL WHEY 140G","status":"","nome":"IOG WHEY 11 FRUTAS VERMELHAS 140G","descricao_original":"IOG WHEY 11 FRUTAS VERMELHAS 140G CX 12","un_cx":12,"preco_st":84.73,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2023/03/Pote_NaturalWhey_FrutasVermelhas-1.png"},{"codigo":"80.878.0006","sap":"2157223010","ean":"7898205925401","categoria":"WHEY IOGURTE","subcategoria":"WHEY COLHERÁVEL","linha":"WHEY COLHERÁVEL","secao":"IOGURTES NATURAL WHEY 140G","status":"","nome":"IOG WHEY 11 MARACUJA 140G","descricao_original":"IOG WHEY 11 MARACUJA 140G CX 12","un_cx":12,"preco_st":84.73,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2023/03/Pote_NaturalWhey_Maracuja-1.png"},{"codigo":"80.876.0009","sap":"2157223129","ean":"7898205925388","categoria":"WHEY IOGURTE","subcategoria":"WHEY COLHERÁVEL","linha":"WHEY COLHERÁVEL","secao":"IOGURTES NATURAL WHEY 140G","status":"","nome":"IOG WHEY 14 TRADICIONAL 140G","descricao_original":"IOG WHEY 14 TRADICIONAL 140G CX 12","un_cx":12,"preco_st":84.73,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2023/03/Pote_NaturalWhey_Tradicional-1.png"},{"codigo":"80.879.0001","sap":"2157176157","ean":"7898205925463","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.10G","linha":"WHEY I.10G","secao":"IOGURTES NATURAL WHEY 170G","status":"","nome":"IOG WHEY 10 GOJIBERRY 170G","descricao_original":"IOG WHEY 10 GOJIBERRY VC 170G CX 12","un_cx":12,"preco_st":61.22,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2023/03/VerdeCampo_GojiCran170g.png"},{"codigo":"80.879.0002","sap":"2157176000","ean":"7898205925470","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.10G","linha":"WHEY I.10G","secao":"IOGURTES NATURAL WHEY 170G","status":"","nome":"IOG WHEY 10 PESSEGO 170G","descricao_original":"IOG WHEY 10 PESSEGO VC 170G CX 12","un_cx":12,"preco_st":61.22,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2023/03/VerdeCampo_Pessego_170g.png"},{"codigo":"80.876.0001","sap":"2157193133","ean":"7898205924206","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.15G","linha":"WHEY I.15G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 15 BANANA 250G","descricao_original":"IOG WHEY 15 BANANA VC 250G CX 12","un_cx":12,"preco_st":111.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Banana-15g-de-Proteina-Verde-Campo-250g-foto.png"},{"codigo":"80.876.0002","sap":"2157177134","ean":"7898205924312","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.15G","linha":"WHEY I.15G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 15 BAUNILHA 250G","descricao_original":"IOG WHEY 15 BAUNILHA VC 250G CX 12","un_cx":12,"preco_st":111.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Baunilha-15g-de-Proteina-Verde-Campo-250g-foto.png"},{"codigo":"80.876.0004","sap":"2157177164","ean":"7898205924435","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.15G","linha":"WHEY I.15G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 15 COOKIES&CREAM 250G","descricao_original":"IOG WHEY 15 COOKIES&CREAM VC 250G CX 12","un_cx":12,"preco_st":111.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Cookies-and-Cream-15g-de-Proteina-Verde-Campo-250g-foto.png"},{"codigo":"80.876.0008","sap":"2157177066","ean":"7898205924220","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.15G","linha":"WHEY I.15G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 15 MORANGO 250G","descricao_original":"IOG WHEY 15 MORANGO VC 250G CX 12","un_cx":12,"preco_st":111.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Morango-15g-de-Proteina-Verde-Campo-250g-foto.png"},{"codigo":"80.876.0021","sap":"","ean":"7898205925845","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"LANÇAMENTO","nome":"IOG WHEY 21 ACAI 250G","descricao_original":"IOG WHEY 21 ACAI VC 250G CX 12","un_cx":12,"preco_st":144.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/41441-Iogurte-Natural-Whey-Fibras-Acai-21g.png"},{"codigo":"80.876.0010","sap":"2157177803","ean":"7898205925128","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 21 COCO 250G","descricao_original":"IOG WHEY 21 COCO VC 250G CX 12","un_cx":12,"preco_st":131.34,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2019/10/37484-MOCKUP-NR-NATURAL-WHEY-21G-DE-PROTEINA-COCO-250G_AF01.png"},{"codigo":"80.876.0011","sap":"2157177165","ean":"7898205924671","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 21 DOCE DE LEITE 250G","descricao_original":"IOG WHEY 21 DOCE DE LEITE VC 250G CX 12","un_cx":12,"preco_st":131.34,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37486-MOCKUP-NR-NATURAL-WHEY-21G-DE-PROTEINA-DOCE-DE-LEITE-250G_AF01.png"},{"codigo":"80.876.0020","sap":"","ean":"7898205925838","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"LANÇAMENTO","nome":"IOG WHEY 21 MARACUJA 250G","descricao_original":"IOG WHEY 21 MARACUJA VC 250G CX 12","un_cx":12,"preco_st":144.48,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/41442-Iogurte-Natural-Whey-Fibras-Maracuja-21g-1.png"},{"codigo":"80.876.0012","sap":"2157177177","ean":"7898205924916","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 21 MORANGO 250G","descricao_original":"IOG WHEY 21 MORANGO VC 250G CX 12","un_cx":12,"preco_st":131.34,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2019/04/37488-MOCKUP-NR-NATURAL-WHEY-21G-DE-PROTEINA-MORANGO-250G_AF01.png"},{"codigo":"80.876.0014","sap":"2157177017","ean":"7898205925203","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.21G","linha":"WHEY I.21G","secao":"IOGURTES NATURAL WHEY 250G","status":"","nome":"IOG WHEY 21 TORTA LIMAO 250G","descricao_original":"IOG WHEY 21 TORTA LIMAO VC 250G CX 12","un_cx":12,"preco_st":131.34,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/06/37734-MOCKUP-NR-NATURAL-WHEY-21G-DE-PROTEINA-TORTA-DE-LIMAO-250G_AF01.png"},{"codigo":"80.876.0015","sap":"2157207232","ean":"7898205925210","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.30G","linha":"WHEY I.30G","secao":"IOGURTES NATURAL WHEY 500G","status":"","nome":"IOG WHEY 30 COCO 500G","descricao_original":"IOG WHEY 30 COCO VC 500G CX 12","un_cx":12,"preco_st":177.71,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Coco-30g-de-Proteina-Verde-Campo-500g-foto.png"},{"codigo":"80.876.0016","sap":"2157173164","ean":"7898205924732","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.30G","linha":"WHEY I.30G","secao":"IOGURTES NATURAL WHEY 500G","status":"","nome":"IOG WHEY 30 COOKIES&CREAM 500G","descricao_original":"IOG WHEY 30 COOKIES&CREAM VC 500G CX 12","un_cx":12,"preco_st":177.71,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Cookies-and-Cream-30g-de-Proteina-Verde-Campo-500g-foto.png"},{"codigo":"80.876.0018","sap":"2157173177","ean":"7898205924725","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.30G","linha":"WHEY I.30G","secao":"IOGURTES NATURAL WHEY 500G","status":"","nome":"IOG WHEY 30 MORANGO 500G","descricao_original":"IOG WHEY 30 MORANGO VC 500G CX 12","un_cx":12,"preco_st":177.71,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Morango-30g-de-Proteina-Verde-Campo-500g-foto.png"},{"codigo":"80.876.0019","sap":"2157207129","ean":"7898205925357","categoria":"WHEY IOGURTE","subcategoria":"WHEY I.30G","linha":"WHEY I.30G","secao":"IOGURTES NATURAL WHEY 500G","status":"","nome":"IOG WHEY 30 TRADICIONAL 500G","descricao_original":"IOG WHEY 30 TRADICIONAL VC 500G CX 12","un_cx":12,"preco_st":177.71,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2026/01/Iogurte-Natural-Whey-Tradicional-30g-de-Proteina-Verde-Campo-500g-foto.png"},{"codigo":"80.883.0012","sap":"2169209163","ean":"7898205924800","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO 170G","secao":"IOGURTES PROBIÓTICOS 170G","status":"","nome":"IOG PROBIOTICO BMM 170G","descricao_original":"IOG PROBIOTICO BMM VC 170G CX 12","un_cx":12,"preco_st":50.63,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2020/08/37352-MOCKUP-NR-IOGURTE-PROBIOTICO-MORANGO-170G_AF01.png"},{"codigo":"80.883.0016","sap":"2169209006","ean":"7898205924824","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO 170G","secao":"IOGURTES PROBIÓTICOS 170G","status":"","nome":"IOG PROBIOTICO MORANGO 170G","descricao_original":"IOG PROBIOTICO MORANGO VC 170G CX 12","un_cx":12,"preco_st":50.63,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2020/08/37352-MOCKUP-NR-IOGURTE-PROBIOTICO-MORANGO-170G_AF01.png"},{"codigo":"80.883.0014","sap":"2169173232","ean":"7898205925265","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO 500G","secao":"IOGURTES PROBIÓTICOS 500G","status":"","nome":"IOG PROBIOTICO COCO 500G","descricao_original":"IOG PROBIOTICO COCO VC 500G CX12","un_cx":12,"preco_st":124.07,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/06/7898205925265-1-removebg-preview.png"},{"codigo":"80.883.0017","sap":"2169210006","ean":"7898205924787","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO 500G","secao":"IOGURTES PROBIÓTICOS 500G","status":"","nome":"IOG PROBIOTICO MORANGO 500G","descricao_original":"IOG PROBIOTICO MORANGO VC 500G CX 12","un_cx":12,"preco_st":124.07,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2020/08/37472-MOCKUP-NR-IOGURTE-TRADICIONAL-MORANGO-500G_AF01.png"},{"codigo":"80.883.0018","sap":"2169210027","ean":"7898205924794","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO 500G","secao":"IOGURTES PROBIÓTICOS 500G","status":"","nome":"IOG PROBIOTICO TRADICIONAL 500G","descricao_original":"IOG PROBIOTICO TRADICIONAL VC 500G CX12","un_cx":12,"preco_st":124.07,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37869-MOCKUP-NR-IOGURTE-TRADICIONAL-SABOR-TRADICIONAL-500G_AF01.png"},{"codigo":"80.883.0010","sap":"2169173247","ean":"7898205925234","categoria":"IOGURTE","subcategoria":"PROBIOTICO","linha":"PROBIOTICO ZERO 500G","secao":"IOGURTES PROBIÓTICOS TRIPLO ZERO 500G","status":"","nome":"IOG PROB TRIPLO ZERO MORAN 500G","descricao_original":"IOG PROB TRIPLO ZERO MORAN VC 500G CX12","un_cx":12,"preco_st":130.37,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2021/06/37847-MOCKUP-NR-LINHA-PROBIOTICO-TRIPLO-ZERO-MORANGO-500G_AF01.png"},{"codigo":"80.881.0001","sap":"2157176173","ean":"7898205924862","categoria":"IOGURTE","subcategoria":"KIDS","linha":"KIDS","secao":"LINHA KIDS","status":"","nome":"IOG KIDS BM 170G","descricao_original":"IOG KIDS BM VC 170G CX 12","un_cx":12,"preco_st":45.6,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.881.0002","sap":"2157176006","ean":"7898205924879","categoria":"IOGURTE","subcategoria":"KIDS","linha":"KIDS","secao":"LINHA KIDS","status":"","nome":"IOG KIDS MORANGO 170G","descricao_original":"IOG KIDS MORANGO VC 170G CX 12","un_cx":12,"preco_st":45.6,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.833.0001","sap":"2155204027","ean":"7898205925654","categoria":"PASTAS","subcategoria":"COALHADA","linha":"COALHADA SECA","secao":"PASTAS","status":"","nome":"COALHADA SECA 180G","descricao_original":"COALHADA SECA 180G VC CX 12","un_cx":12,"preco_st":111.85,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.801.0000","sap":"","ean":"7898205925425","categoria":"PASTAS","subcategoria":"MANTEIGA","linha":"MANTEIGA","secao":"PASTAS","status":"LANÇAMENTO","nome":"MANTEIGA LACFREE 200G","descricao_original":"MANTEIGA LACFREE 200G VC CX 12","un_cx":12,"preco_st":143.08,"unidade":"CX","peso_kg":0,"imagem":""},{"codigo":"80.801.0001","sap":"2155179027","ean":"7898205920239","categoria":"PASTAS","subcategoria":"COTTAGE","linha":"COTTAGE 200G","secao":"PASTAS","status":"","nome":"QUEIJO COTTAGE LACFREE 200G","descricao_original":"QUEIJO COTTAGE LACFREE VC 200G CX 12","un_cx":12,"preco_st":140.76,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/12/VC_CottageLacfree_200g-1.png"},{"codigo":"80.801.0002","sap":"2162180170","ean":"7898205924053","categoria":"PASTAS","subcategoria":"COTTAGE","linha":"COTTAGE 400G","secao":"PASTAS","status":"","nome":"QUEIJO COTTAGE LACFREE 400G","descricao_original":"QUEIJO COTTAGE LACFREE VC 400G CX 12","un_cx":12,"preco_st":252.95,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/12/VC_CottageLacfree_400g-1.png"},{"codigo":"80.801.0003","sap":"2162179172","ean":"7898205920215","categoria":"PASTAS","subcategoria":"COTTAGE","linha":"COTTAGE 200G","secao":"PASTAS","status":"","nome":"QUEIJO COTTAGE TRAD 200G","descricao_original":"QUEIJO COTTAGE TRAD VC 200G CX 12","un_cx":12,"preco_st":121.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/12/VC_CottageLacfree_200g-1.png"},{"codigo":"80.801.0004","sap":"2162180027","ean":"7898205924374","categoria":"PASTAS","subcategoria":"COTTAGE","linha":"COTTAGE 400G","secao":"PASTAS","status":"","nome":"QUEIJO COTTAGE TRAD 400G","descricao_original":"QUEIJO COTTAGE TRAD VC 400G CX 12","un_cx":12,"preco_st":216.43,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/12/VC_CottageLacfree_400g-1.png"},{"codigo":"80.912.0001","sap":"2163192027","ean":"7898205923858","categoria":"PASTAS","subcategoria":"REQUEIJAO","linha":"REQUEIJAO","secao":"PASTAS","status":"","nome":"REQUEIJAO LACFREE 180G","descricao_original":"REQUEIJAO LACFREE 180G CX 12","un_cx":12,"preco_st":127.11,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/11/WhatsApp_Image_2024-10-31_at_16.04.43-removebg-preview.png"},{"codigo":"80.912.0003","sap":"2163254027","ean":"7898205925197","categoria":"PASTAS","subcategoria":"REQUEIJAO","linha":"REQUEIJAO","secao":"PASTAS","status":"","nome":"REQUEIJAO LACFREE 400G","descricao_original":"REQUEIJAO LACFREE 400G CX 12","un_cx":12,"preco_st":255.16,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/11/WhatsApp_Image_2024-10-31_at_16.04.43__1_-removebg-preview.png"},{"codigo":"80.912.0004","sap":"","ean":"7898205925739","categoria":"PASTAS","subcategoria":"REQUEIJAO","linha":"REQUEIJAO","secao":"PASTAS","status":"LANÇAMENTO","nome":"REQUEIJAO TRADICIONAL 180G","descricao_original":"REQUEIJAO TRADICIONAL 180G VC CX 12","un_cx":12,"preco_st":108.05,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/07/Mockup-Requeijao-Tradicional-180g-removebg-preview.png"},{"codigo":"80.831.0001","sap":"2162177027","ean":"7898205924336","categoria":"QUEIJO","subcategoria":"FRESCAL","linha":"FRESCAL 250G","secao":"QUEIJO FRESCAL","status":"","nome":"QUEIJO FRESCAL LACFREE 250G","descricao_original":"QUEIJO FRESCAL LACFREE VC 250G CX 12","un_cx":12,"preco_st":45.0,"unidade":"KG","peso_kg":3.2,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37874-MOCKUP-NR-QUEIJO-MINAS-FRESCAL-LACFREE-250G_AF02.png"},{"codigo":"80.831.0003","sap":"2162270170","ean":"7898205923278","categoria":"QUEIJO","subcategoria":"FRESCAL","linha":"FRESCAL 450G","secao":"QUEIJO FRESCAL","status":"","nome":"QUEIJO FRESCAL LIGHT 450G","descricao_original":"QUEIJO FRESCAL LIGHT VC 450G CX 08","un_cx":8,"preco_st":38.05,"unidade":"KG","peso_kg":3.6,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37743-MOCKUP-NR-QUEIJO-MINAS-FRESCAL-LIGHT-450G_AF01-2.png"},{"codigo":"80.831.0008","sap":"2162270027","ean":"7898205923728","categoria":"QUEIJO","subcategoria":"FRESCAL","linha":"FRESCAL 450G","secao":"QUEIJO FRESCAL","status":"","nome":"QUEIJO FRESCAL TRAD 450G","descricao_original":"QUEIJO FRESCAL TRAD VC 450G CX 08","un_cx":8,"preco_st":37.46,"unidade":"KG","peso_kg":3.6,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/38384-MOCKUP-NR-QUEIJO-MINAS-FRESCAL-450_AF01.png"},{"codigo":"80.831.0007","sap":"2162181027","ean":"7898205923728","categoria":"QUEIJO","subcategoria":"FRESCAL","linha":"FRESCAL 450G","secao":"QUEIJO FRESCAL","status":"","nome":"QUEIJO FRESCAL TRAD 450G","descricao_original":"QUEIJO FRESCAL TRAD VC 450G CX 18","un_cx":18,"preco_st":37.46,"unidade":"KG","peso_kg":8.1,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/38384-MOCKUP-NR-QUEIJO-MINAS-FRESCAL-450_AF01.png"},{"codigo":"80.861.0001","sap":"2166221027","ean":"7898205924909","categoria":"QUEIJO","subcategoria":"MUSSARELA","linha":"MUSSARELA FATIADA","secao":"QUEIJO MUSSARELA","status":"","nome":"QUEIJO MUSSARELA LACFREE 150G","descricao_original":"QUEIJO MUSSARELA LACFREE 150G CX 32","un_cx":32,"preco_st":351.85,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/07/Queijo-mussarela-fatiada-LACFREE-150g-1.png"},{"codigo":"80.861.0002","sap":"2166190027","ean":"7898205924015","categoria":"QUEIJO","subcategoria":"MUSSARELA","linha":"MUSSARELA 3KG","secao":"QUEIJO MUSSARELA","status":"","nome":"QUEIJO MUSSARELA LACFREE 3KG","descricao_original":"QUEIJO MUSSARELA LACFREE VC 3KG CX 6","un_cx":6,"preco_st":54.34,"unidade":"KG","peso_kg":17.0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37553-MOCKUP-NR-QUEIJO-MUSSARELA-LACFREE-500G_AF01.png"},{"codigo":"80.861.0003","sap":"2166173027","ean":"7898205924138","categoria":"QUEIJO","subcategoria":"MUSSARELA","linha":"MUSSARELA 500G","secao":"QUEIJO MUSSARELA","status":"","nome":"QUEIJO MUSSARELA LACFREE 500G","descricao_original":"QUEIJO MUSSARELA LACFREE VC 500G CX 12","un_cx":12,"preco_st":54.84,"unidade":"KG","peso_kg":5.8,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37553-MOCKUP-NR-QUEIJO-MUSSARELA-LACFREE-500G_AF01.png"},{"codigo":"80.861.0004","sap":"2166190170","ean":"7898205923797","categoria":"QUEIJO","subcategoria":"MUSSARELA","linha":"MUSSARELA 3KG","secao":"QUEIJO MUSSARELA","status":"","nome":"QUEIJO MUSSARELA LIGHT 3KG","descricao_original":"QUEIJO MUSSARELA LIGHT VC 3KG CX 6","un_cx":6,"preco_st":54.03,"unidade":"KG","peso_kg":17.0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37553-MOCKUP-NR-QUEIJO-MUSSARELA-LACFREE-500G_AF01.png"},{"codigo":"80.862.0001","sap":"2162191172","ean":"7898205923810","categoria":"QUEIJO","subcategoria":"PADRÃO","linha":"PADRÃO 450G","secao":"QUEIJO PADRÃO","status":"","nome":"QUEIJO P. COBOCO 450G","descricao_original":"QUEIJO P. COBOCO VC 450G CX 16","un_cx":16,"preco_st":55.94,"unidade":"KG","peso_kg":6.9,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/38029-MOCKUP-NR-QUEIJO-MINAS-PADRAO-LIGHT-450G-1.png"},{"codigo":"80.832.0006","sap":"2162211027","ean":"7898205924756","categoria":"QUEIJO","subcategoria":"PADRÃO","linha":"PADRÃO 450G","secao":"QUEIJO PADRÃO","status":"","nome":"QUEIJO PADRAO 450G","descricao_original":"QUEIJO PADRAO VC 450G CX 16","un_cx":16,"preco_st":54.87,"unidade":"KG","peso_kg":6.9,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2019/04/19508-MOCKUP-COCA-COLA-QUEIJO-MINAS-PADRAO-450G_AF02.png"},{"codigo":"80.832.0002","sap":"2162191027","ean":"7898205923896","categoria":"QUEIJO","subcategoria":"PADRÃO","linha":"PADRÃO 450G","secao":"QUEIJO PADRÃO","status":"","nome":"QUEIJO PADRAO LACFREE 450G","descricao_original":"QUEIJO PADRAO LACFREE VC 450G CX 16","un_cx":16,"preco_st":64.47,"unidade":"KG","peso_kg":6.9,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/7898205923896-Sem-Fundo.png"},{"codigo":"80.832.0004","sap":"2162191170","ean":"7898205923766","categoria":"QUEIJO","subcategoria":"PADRÃO","linha":"PADRÃO 450G","secao":"QUEIJO PADRÃO","status":"","nome":"QUEIJO PADRAO LIGHT 450G","descricao_original":"QUEIJO PADRAO LIGHT VC 450G CX 16","un_cx":16,"preco_st":58.25,"unidade":"KG","peso_kg":6.9,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/38029-MOCKUP-NR-QUEIJO-MINAS-PADRAO-LIGHT-450G-1.png"},{"codigo":"80.862.0002","sap":"2162173027","ean":"7898205924121","categoria":"QUEIJO","subcategoria":"PADRÃO","linha":"PADRÃO 450G","secao":"QUEIJO PRATO","status":"","nome":"QUEIJO P. LANCHE LACFREE 500G","descricao_original":"QUEIJO P. LANCHE LACFREE VC 500G CX 12","un_cx":12,"preco_st":55.9,"unidade":"KG","peso_kg":5.6,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2018/11/37553-MOCKUP-NR-QUEIJO-MUSSARELA-LACFREE-500G_AF01.png"},{"codigo":"80.900.0001","sap":"2158193134","ean":"7898205924398","categoria":"WHEY SHAKE","subcategoria":"WHEY S.14G","linha":"WHEY S.14G","secao":"SHAKES WHEY 14","status":"","nome":"SHAKE 14 WHEY BAUNILHA 250 ML","descricao_original":"SHAKE 14 WHEY BAUNILHA VC 250 ML CX 12","un_cx":12,"preco_st":59.36,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/04/MOCKUP-NR-NATURAL-WHEY-SHAKE-BAUNILHA-250G-18032025.png"},{"codigo":"80.900.0002","sap":"2158193261","ean":"7898205925340","categoria":"WHEY SHAKE","subcategoria":"WHEY S.14G","linha":"WHEY S.14G","secao":"SHAKES WHEY 14","status":"","nome":"SHAKE 14 WHEY CAPPUCCINO 250 ML","descricao_original":"SHAKE 14 WHEY CAPPUCCINO VC 250 ML CX 12","un_cx":12,"preco_st":59.36,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/04/MOCKUP-NR-NATURAL-WHEY-14G-DE-PROTEINA-CAPPUCCINO-250G_18032025.png"},{"codigo":"80.900.0003","sap":"2158193214","ean":"7898205925364","categoria":"WHEY SHAKE","subcategoria":"WHEY S.14G","linha":"WHEY S.14G","secao":"SHAKES WHEY 14","status":"","nome":"SHAKE 14 WHEY CARAMELO 250 ML","descricao_original":"SHAKE 14 WHEY CARAMELO VC 250 ML CX 12","un_cx":12,"preco_st":59.36,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/04/MOCKUP-NATURAL-WHEY-14G-DE-PROTEINA-CARAMELO-250G_18032025.png"},{"codigo":"80.900.0004","sap":"2158193024","ean":"7898205924411","categoria":"WHEY SHAKE","subcategoria":"WHEY S.14G","linha":"WHEY S.14G","secao":"SHAKES WHEY 14","status":"","nome":"SHAKE 14 WHEY CHOCOLATE 250 ML","descricao_original":"SHAKE 14 WHEY CHOCOLATE VC 250 ML CX 12","un_cx":12,"preco_st":59.53,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/04/MOCKUP-NR-NATURAL-WHEY-SHAKE-CHOCOLATE-250G-18032025.png"},{"codigo":"80.900.0005","sap":"","ean":"7898205925791","categoria":"WHEY SHAKE","subcategoria":"WHEY S.100%","linha":"WHEY S.100%","secao":"SHAKES WHEY 15","status":"LANÇAMENTO","nome":"SHAKE 15 100% WHEY CHOCOLATE 250ML","descricao_original":"SHAKE 15 100% WHEY CHOCOLATE VC 250ML CX 12","un_cx":12,"preco_st":71.43,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/07/Shake-Natural-Whey-Chocolate-100_.png"},{"codigo":"80.900.0006","sap":"","ean":"7898205925807","categoria":"WHEY SHAKE","subcategoria":"WHEY S.100%","linha":"WHEY S.100%","secao":"SHAKES WHEY 15","status":"LANÇAMENTO","nome":"SHAKE 15 100% WHEY MORANGO 250ML","descricao_original":"SHAKE 15 100% WHEY MORANGO VC 250ML CX 12","un_cx":12,"preco_st":71.25,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/07/Shake-Natural-Whey-Morango-100_.png"},{"codigo":"80.878.0008","sap":"2174275133","ean":"7898205925647","categoria":"SOBREMESA","subcategoria":"BICAMADA","linha":"BICAMADA","secao":"SOBREMESA (CAIXA COM 12 UNIDADES)","status":"","nome":"SOBREMESA BANANA E CANELA 200G","descricao_original":"SOBREMESA BANANA E CANELA 200G VC CX 12","un_cx":12,"preco_st":83.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/10/SOBREMESA-BananaCanela.png"},{"codigo":"80.878.0007","sap":"2174275019","ean":"7898205925630","categoria":"SOBREMESA","subcategoria":"BICAMADA","linha":"BICAMADA","secao":"SOBREMESA (CAIXA COM 12 UNIDADES)","status":"","nome":"SOBREMESA FRUTAS VERMELHAS 200G","descricao_original":"SOBREMESA FRUTAS VERMELHAS 200G VC CX 12","un_cx":12,"preco_st":83.62,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2024/10/41413-MOCKUP-SOBREMESA-CREMOSA-FRUTAS-VERMELHAS-SEM-LACTOSE_AF02.png"},{"codigo":"80.878.0012","sap":"","ean":"7898205925821","categoria":"SOBREMESA","subcategoria":"PROTEICA","linha":"PROTEICA","secao":"SOBREMESA (CAIXA COM 12 UNIDADES)","status":"LANÇAMENTO","nome":"SOBREMESA PROTEICA CHOCOLATE 130G","descricao_original":"SOBREMESA PROTEICA CHOCOLATE 130G VC CX 12","un_cx":12,"preco_st":84.53,"unidade":"CX","peso_kg":0,"imagem":"https://admin.verdecampo.com.br/wp-content/uploads/2025/10/VCNW_Sobremesa-1-1.png"}];
let PRODUCTS = [...DEFAULT_PRODUCTS];

const VC_GREEN = '#1F6B2E';
const VC_GREEN_LIGHT = '#3D8C42';
const VC_GREEN_BG = '#E8F5E9';

// ---- Catalog parsing & merging ----

// Infer category from product name when the table doesn't provide a Categoria column
function inferCategoria(nome) {
  const n = (nome || '').toUpperCase();
  if (/\bSHAKE\b/.test(n)) return 'WHEY SHAKE';
  if (/\bWHEY\b/.test(n)) return 'WHEY IOGURTE';
  if (/\bSOBREMESA\b/.test(n)) return 'SOBREMESA';
  if (/\bCREME DE LEITE\b/.test(n)) return 'CREME';
  if (/\b(COTTAGE|REQUEIJAO|REQUEIJÃO|MANTEIGA|COALHADA|PASTA)\b/.test(n)) return 'PASTAS';
  if (/\bQUEIJO\b/.test(n)) return 'QUEIJO';
  if (/\b(IOG|IOGURTE|KEFIR|LACFREE|PROBIOTICO|PROBIÓTICO)\b/.test(n)) return 'IOGURTE';
  return 'OUTROS';
}

async function parsePriceTable(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('Arquivo .xlsx sem planilhas.');
  }
  // Prefer sheet named "Export"; otherwise use first
  const sheetName = wb.SheetNames.find(n => /export/i.test(n)) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  if (rows.length === 0) throw new Error('Planilha vazia.');

  // Map columns tolerantly (Verde Campo can vary naming)
  const headers = Object.keys(rows[0]);
  const findCol = (...candidates) => {
    for (const c of candidates) {
      const found = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
      if (found) return found;
    }
    return null;
  };
  const COL_CODIGO = findCol('Código', 'Codigo', 'Cod. TOTVS', 'Cód. TOTVS', 'Material');
  const COL_DESC = findCol('Descrição', 'Descricao', 'Produto', 'Texto breve material');
  const COL_PRECO = findCol('Preço com ST', 'Preco com ST', 'Preço c/ ST', 'Preço');
  const COL_CAT = findCol('Categoria');
  const COL_SUB = findCol('Subcategoria');
  const COL_LINHA = findCol('Linha');

  if (!COL_CODIGO || !COL_DESC || !COL_PRECO) {
    throw new Error(
      `Colunas obrigatórias não encontradas. A tabela precisa ter: Código, Descrição, Preço com ST.\n\nColunas detectadas: ${headers.join(', ')}`
    );
  }

  const products = [];
  const seen = new Set();
  for (const row of rows) {
    const codigoRaw = row[COL_CODIGO];
    const descRaw = row[COL_DESC];
    const precoRaw = row[COL_PRECO];
    if (codigoRaw == null || descRaw == null || precoRaw == null) continue;
    const codigo = String(codigoRaw).trim();
    const descStr = String(descRaw).trim();
    if (!codigo || !descStr) continue;
    if (seen.has(codigo)) continue; // skip duplicates
    seen.add(codigo);

    const precoNum = typeof precoRaw === 'number' ? precoRaw : parseFloat(String(precoRaw).replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) continue;

    const match = descStr.match(/CX\s*(\d+)/i);
    const un_cx = match ? parseInt(match[1], 10) : 12;

    let nome = descStr
      .replace(/\s+CX\s*\d+\s*$/i, '')
      .replace(/\s+VC\s+/g, ' ')
      .replace(/\s+VC\s*$/i, '')
      .trim()
      .replace(/\s+/g, ' ');

    const catFromCol = COL_CAT ? String(row[COL_CAT] || '').trim() : '';
    products.push({
      codigo,
      categoria: catFromCol || inferCategoria(nome),
      subcategoria: COL_SUB ? String(row[COL_SUB] || '').trim() : '',
      linha: COL_LINHA ? String(row[COL_LINHA] || '').trim() : '',
      descricao_original: descStr,
      nome,
      un_cx,
      preco_st: Math.round(precoNum * 100) / 100,
    });
  }

  if (products.length === 0) {
    throw new Error('Nenhum produto válido foi encontrado na planilha. Verifique se os preços estão preenchidos.');
  }
  return products;
}

function mergeProducts(newList, oldList) {
  const oldMap = {};
  oldList.forEach(p => { oldMap[p.codigo] = p; });
  return newList.map(p => {
    const old = oldMap[p.codigo];
    if (old) {
      return {
        ...p,
        // Preserve richer classification from existing catalog when present
        categoria: old.categoria || p.categoria,
        subcategoria: old.subcategoria || p.subcategoria,
        linha: old.linha || p.linha,
        sap: old.sap || '',
        ean: old.ean || '',
        secao: old.secao || p.linha || '',
        status: old.status || '',
        unidade: old.unidade || 'CX',
        peso_kg: old.peso_kg || 0,
        imagem: old.imagem || '',
      };
    }
    return {
      ...p,
      categoria: p.categoria || inferCategoria(p.nome),
      sap: '',
      ean: '',
      secao: p.linha || 'NOVOS',
      status: 'NOVO',
      unidade: 'CX',
      peso_kg: 0,
      imagem: '',
    };
  });
}

const CAT_ICONS = {
  'IOGURTE': '🥛',
  'WHEY IOGURTE': '💪',
  'WHEY SHAKE': '🥤',
  'SOBREMESA': '🍮',
  'QUEIJO': '🧀',
  'PASTAS': '🧈',
  'CREME': '🥛'
};

const CAT_ORDER = ['IOGURTE', 'WHEY IOGURTE', 'WHEY SHAKE', 'SOBREMESA', 'QUEIJO', 'PASTAS', 'CREME'];

// Order of sections in the export (matches Verde Campo template order)
const SECAO_ORDER = [
  'LINHA KIDS',
  'IOGURTE DESNATADO NATURAL',
  'IOGURTES NATURAL WHEY 140G',
  'IOGURTES NATURAL WHEY 170G',
  'IOGURTES NATURAL WHEY 250G',
  'IOGURTES NATURAL WHEY 500G',
  'IOGURTES INTEGRAL 2 INGR',
  'IOGURTES DESN 2 INGR',
  'SOBREMESA (CAIXA COM 12 UNIDADES)',
  'IOGURTES LACFREE 140G (CAIXA COM 12 UNIDADES)',
  'IOGURTES LACFREE 170G',
  'IOGURTES LACFREE 500G',
  'IOG TRADICIONAL BATIDO 500G',
  'IOG A2 INTEGRAL 500G',
  'IOGURTES KEFIR 500G',
  'IOG TRADICIONAL MORANGO',
  'IOGURTES PROBIÓTICOS 170G',
  'IOGURTES PROBIÓTICOS 500G',
  'IOGURTES PROBIÓTICOS TRIPLO ZERO 500G',
  'CREMES 500G',
  'PASTAS',
  'QUEIJO FRESCAL',
  'QUEIJO MUSSARELA',
  'QUEIJO PRATO',
  'QUEIJO PADRÃO',
  'SHAKES WHEY 14',
  'SHAKES WHEY 15'
];

// ---- Storage helpers (works in both Claude artifacts and regular browsers) ----
const hasClaudeStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

const store = {
  async get(key, fallback = null) {
    try {
      if (hasClaudeStorage) {
        const r = await window.storage.get(key);
        return r && r.value != null ? JSON.parse(r.value) : fallback;
      }
      if (hasLocalStorage) {
        const v = localStorage.getItem(key);
        return v != null ? JSON.parse(v) : fallback;
      }
      return fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try {
      if (hasClaudeStorage) {
        await window.storage.set(key, JSON.stringify(value));
        return true;
      }
      if (hasLocalStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      return false;
    } catch { return false; }
  },
  async delete(key) {
    try {
      if (hasClaudeStorage) {
        await window.storage.delete(key);
        return true;
      }
      if (hasLocalStorage) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch { return false; }
  }
};

// ---- Utility functions ----
const uid = () => Math.random().toString(36).slice(2, 11);
const formatBRL = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatBRLPlain = (n) => 'R$ ' + (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatKgPlain = (n) => (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const findProduct = (codigo) => PRODUCTS.find(p => p.codigo === codigo);

// Image proxy to bypass hotlink protection and CORS issues
const proxyImage = (url, size = 240) => {
  if (!url) return '';
  // wsrv.nl: server-side image proxy + resizing
  const stripped = url.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${stripped}&w=${size}&output=png`;
};

// ProductImage component with fallback to category icon
function ProductImage({ product, size = 48, className = '' }) {
  const [failed, setFailed] = useState(false);
  const hasImage = product?.imagem && !failed;
  const iconSize = size >= 48 ? 'text-2xl' : size >= 36 ? 'text-xl' : 'text-base';
  
  return (
    <div
      className={`rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: VC_GREEN_BG }}
    >
      {hasImage ? (
        <img
          src={proxyImage(product.imagem, Math.max(120, size * 2))}
          alt={product.nome}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={iconSize}>{CAT_ICONS[product?.categoria] || '📦'}</span>
      )}
    </div>
  );
}

const calcItem = (item) => {
  const p = findProduct(item.codigo);
  if (!p) return { totalUn: 0, vlUnit: 0, vlTotal: 0, totalKg: 0, isKg: false };
  const caixas = parseFloat(item.caixas) || 0;
  const desc = parseFloat(item.descPct) || 0;
  const totalUn = caixas * p.un_cx;
  const isKg = p.unidade === 'KG' && p.peso_kg > 0;
  let vlTotal, vlUnit, totalKg = 0;
  if (isKg) {
    totalKg = caixas * p.peso_kg;
    vlTotal = totalKg * p.preco_st * (1 - desc / 100);
    vlUnit = p.preco_st; // price per kg
  } else {
    vlTotal = caixas * p.preco_st * (1 - desc / 100);
    vlUnit = p.preco_st / p.un_cx;
  }
  return { totalUn, vlUnit, vlTotal, totalKg, isKg };
};

const calcOrder = (items) => {
  let total = 0, totalCaixas = 0, totalBonif = 0, totalKg = 0;
  items.forEach(item => {
    const c = calcItem(item);
    total += c.vlTotal;
    totalCaixas += parseFloat(item.caixas) || 0;
    totalBonif += parseFloat(item.bonif) || 0;
    totalKg += c.totalKg;
  });
  return { total, totalCaixas, totalBonif, totalKg };
};

// ---- Styled Export (HTML-as-xls) ----
const exportPedidoStyled = (pedido, cliente, vendedor) => {
  // Group items by section
  const grouped = {};
  pedido.items.forEach(item => {
    const p = findProduct(item.codigo);
    if (!p) return;
    const sect = p.secao || 'OUTROS';
    if (!grouped[sect]) grouped[sect] = [];
    grouped[sect].push({ item, p });
  });

  // Sort sections by template order
  const sortedSections = Object.keys(grouped).sort((a, b) => {
    const ia = SECAO_ORDER.indexOf(a);
    const ib = SECAO_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const { total, totalCaixas, totalBonif, totalKg } = calcOrder(pedido.items);
  const hasExtras = pedido.items.some(i => i.isExtra);

  let html = '\ufeff<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += `<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Pedido</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
  td { border: 1px solid #777; padding: 4px 6px; vertical-align: middle; mso-pattern: auto none; }
  .title { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 14pt; text-align: center; padding: 10px; letter-spacing: 1px; }
  .subtitle { background: #3a3a3a !important; color: #ffffff !important; font-weight: bold; font-size: 10pt; text-align: center; padding: 6px; letter-spacing: 0.5px; }
  .label { background: #ededed !important; font-weight: bold; padding: 4px 8px; }
  .value { padding: 4px 8px; }
  .section { background: #c8c8c8 !important; font-weight: bold; font-size: 11pt; padding: 6px 10px; text-align: left; letter-spacing: 0.5px; }
  .thead { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; text-align: center; padding: 6px 4px; font-size: 9.5pt; }
  .total-label { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 12pt; text-align: right; padding: 8px; letter-spacing: 0.5px; }
  .total-val { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 12pt; text-align: right; padding: 8px; }
  .extra { background: #fff5cc !important; }
  .money { text-align: right; }
  .pct { mso-number-format: '0.00\\%'; text-align: center; }
  .num { mso-number-format: '0'; text-align: center; }
  .kg { text-align: center; }
  .text { mso-number-format: '\\@'; text-align: center; font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; }
  .code { mso-number-format: '\\@'; text-align: center; font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; }
  .left { text-align: left; }
  .footer { font-size: 9pt; padding: 6px 8px; background: #f5f5f5 !important; font-style: italic; }
  .summary-label { background: #ededed !important; font-weight: bold; padding: 6px 8px; text-align: center; }
</style></head><body>
<table>
<colgroup>
  <col style="width: 90pt;">
  <col style="width: 95pt;">
  <col style="width: 110pt;">
  <col style="width: 240pt;">
  <col style="width: 55pt;">
  <col style="width: 55pt;">
  <col style="width: 55pt;">
  <col style="width: 65pt;">
  <col style="width: 80pt;">
  <col style="width: 55pt;">
  <col style="width: 90pt;">
</colgroup>`;

  // Title
  html += `<tr><td colspan="11" class="title">PEDIDO DE VENDA${pedido.numero ? ` &mdash; Nº ${pedido.numero}` : ''}</td></tr>`;
  html += `<tr><td colspan="11" class="subtitle">LATICÍNIOS VERDE CAMPO S.A.</td></tr>`;

  // Empty separator
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;

  // Cliente + Pedido info (two columns)
  html += `<tr>
    <td colspan="6" class="label" style="text-align: center; background: #d9d9d9 !important;">DADOS DO CLIENTE</td>
    <td colspan="5" class="label" style="text-align: center; background: #d9d9d9 !important;">DADOS DO PEDIDO</td>
  </tr>`;
  html += `<tr>
    <td class="label">Razão Social</td><td colspan="5" class="value">${escapeHtml(cliente?.razaoSocial || '-')}</td>
    <td class="label">Data</td><td colspan="4" class="value" style="text-align: center;">${formatDate(pedido.data)}</td>
  </tr>`;
  html += `<tr>
    <td class="label">CNPJ</td><td colspan="5" class="value code" style="text-align: left;">${escapeHtml(cliente?.cnpj || '-')}</td>
    <td class="label">Nº Pedido</td><td colspan="4" class="value" style="text-align: center;">${escapeHtml(pedido.numero || '-')}</td>
  </tr>`;
  html += `<tr>
    <td class="label">IE</td><td colspan="5" class="value code" style="text-align: left;">${escapeHtml(cliente?.ie || '-')}</td>
    <td class="label">Vendedor</td><td colspan="4" class="value">${escapeHtml(vendedor?.nome || '-')}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Telefone</td><td colspan="5" class="value text" style="text-align: left;">${escapeHtml(cliente?.telefone || '-')}</td>
    <td class="label">Tel. Vendedor</td><td colspan="4" class="value text" style="text-align: left;">${escapeHtml(vendedor?.telefone || '-')}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Endereço</td><td colspan="5" class="value">${escapeHtml(cliente?.endereco || '-')}${cliente?.cidade ? ` &mdash; ${escapeHtml(cliente.cidade)}${cliente.uf ? '/' + escapeHtml(cliente.uf) : ''}` : ''}</td>
    <td class="label">E-mail Vend.</td><td colspan="4" class="value">${escapeHtml(vendedor?.email || '-')}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Contato</td><td colspan="5" class="value">${escapeHtml(cliente?.contato || '-')}</td>
    <td class="label">Total Itens</td><td colspan="4" class="value" style="text-align: center;">${pedido.items.length} produto${pedido.items.length !== 1 ? 's' : ''} &middot; ${totalCaixas} caixa${totalCaixas !== 1 ? 's' : ''}</td>
  </tr>`;

  // Empty separator
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;

  // Products table header
  html += `<tr>
    <td class="thead">Cód. SAP</td>
    <td class="thead">Cód. TOTVS</td>
    <td class="thead">Cód. EAN</td>
    <td class="thead">Produto</td>
    <td class="thead">Caixas</td>
    <td class="thead">Bonif.</td>
    <td class="thead">Un/Cx</td>
    <td class="thead">Total Un.</td>
    <td class="thead">Valor Unit.</td>
    <td class="thead">Desc%</td>
    <td class="thead">Vl. Total</td>
  </tr>`;

  // Products by section
  sortedSections.forEach(section => {
    html += `<tr><td colspan="11" class="section">${escapeHtml(section)}</td></tr>`;
    grouped[section].forEach(({ item, p }) => {
      const c = calcItem(item);
      const cls = item.isExtra ? ' extra' : '';
      const descVal = parseFloat(item.descPct) || 0;
      const nomeProduto = escapeHtml(p.nome) + (c.isKg ? ` <span style="font-size: 8pt; color: #555;">(${p.peso_kg.toString().replace('.', ',')} kg/cx)</span>` : '');
      const totalCell = c.isKg
        ? `<td class="kg${cls}">${formatKgPlain(c.totalKg)}</td>`
        : `<td class="num${cls}">${c.totalUn}</td>`;
      const vlUnitDisplay = c.isKg
        ? `<td class="money${cls}">${formatBRLPlain(c.vlUnit)}<span style="font-size: 8pt;"> /kg</span></td>`
        : `<td class="money${cls}">${formatBRLPlain(c.vlUnit)}</td>`;
      html += `<tr>
        <td class="code${cls}">${escapeHtml(p.sap || '-')}</td>
        <td class="code${cls}" style="font-weight: bold;">${escapeHtml(p.codigo)}</td>
        <td class="code${cls}">${escapeHtml(p.ean || '-')}</td>
        <td class="left${cls}">${nomeProduto}${item.obs ? `<br><span style="font-size: 8pt; color: #555;">Obs: ${escapeHtml(item.obs)}</span>` : ''}</td>
        <td class="num${cls}">${item.caixas}</td>
        <td class="num${cls}">${item.bonif || 0}</td>
        <td class="num${cls}">${p.un_cx}</td>
        ${totalCell}
        ${vlUnitDisplay}
        <td class="num${cls}">${descVal > 0 ? descVal + '%' : '-'}</td>
        <td class="money${cls}" style="font-weight: bold;">${formatBRLPlain(c.vlTotal)}</td>
      </tr>`;
    });
  });

  // Summary row
  html += `<tr><td colspan="11" style="border: none; height: 4pt;"></td></tr>`;
  const summaryText = `Total de Caixas: ${totalCaixas}` +
    (totalKg > 0 ? ` &middot; Peso Total: ${formatKgPlain(totalKg)}` : '') +
    (totalBonif > 0 ? ` &middot; Bonificação: ${totalBonif}` : '');
  html += `<tr>
    <td colspan="4" class="summary-label">${summaryText}</td>
    <td colspan="6" class="total-label">TOTAL DO PEDIDO</td>
    <td class="total-val">${formatBRLPlain(total)}</td>
  </tr>`;

  // Observations
  if (pedido.obs) {
    html += `<tr><td colspan="11" style="border: none; height: 4pt;"></td></tr>`;
    html += `<tr>
      <td class="label">Observações</td>
      <td colspan="10" class="value">${escapeHtml(pedido.obs)}</td>
    </tr>`;
  }

  // Extras note
  if (hasExtras) {
    html += `<tr><td colspan="11" class="footer">📌 Itens destacados em fundo amarelo claro são sugestões adicionadas ao pedido original do cliente.</td></tr>`;
  }

  // Footer
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;
  html += `<tr>
    <td colspan="11" class="footer">Fornecedor: LATICÍNIOS VERDE CAMPO S.A. &middot; Av. Luiz Gomide, Lavras-MG &middot; CNPJ: 07.757.005/0001-02 &middot; Frete a pagar &middot; Transportadora: __________</td>
  </tr>`;

  html += `</table></body></html>`;

  const clienteName = (cliente?.razaoSocial || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const numero = pedido.numero || todayISO().replace(/-/g, '');
  const filename = `Pedido_${numero}_${clienteName}.xls`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ============== MAIN APP ==============
export default function App() {
  const [tab, setTab] = useState('pedido');
  const [clientes, setClientes] = useState([]);
  const [vendedor, setVendedor] = useState({ nome: '', telefone: '', email: '' });
  const [pedidoAtual, setPedidoAtual] = useState({ id: uid(), numero: '', data: todayISO(), clienteId: null, items: [], obs: '' });
  const [pedidos, setPedidos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [catVersion, setCatVersion] = useState(0);
  const [catMeta, setCatMeta] = useState({ source: 'default', updatedAt: null, filename: '' });

  useEffect(() => {
    (async () => {
      const storedCat = await store.get('catalogo');
      if (Array.isArray(storedCat) && storedCat.length > 0) {
        PRODUCTS = storedCat;
      }
      const meta = await store.get('catalogo_meta', { source: 'default', updatedAt: null, filename: '' });
      setCatMeta(meta);
      setClientes(await store.get('clientes', []));
      setVendedor(await store.get('vendedor', { nome: '', telefone: '', email: '' }));
      setPedidoAtual(await store.get('pedidoAtual', { id: uid(), numero: '', data: todayISO(), clienteId: null, items: [], obs: '' }));
      setPedidos(await store.get('pedidos', []));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) store.set('clientes', clientes); }, [clientes, loaded]);
  useEffect(() => { if (loaded) store.set('vendedor', vendedor); }, [vendedor, loaded]);
  useEffect(() => { if (loaded) store.set('pedidoAtual', pedidoAtual); }, [pedidoAtual, loaded]);
  useEffect(() => { if (loaded) store.set('pedidos', pedidos); }, [pedidos, loaded]);

  const updateCatalog = async (newProducts, filename) => {
    PRODUCTS = newProducts;
    const meta = { source: 'upload', updatedAt: new Date().toISOString(), filename: filename || '' };
    setCatMeta(meta);
    await store.set('catalogo', newProducts);
    await store.set('catalogo_meta', meta);
    setCatVersion(v => v + 1);
  };

  const resetCatalog = async () => {
    PRODUCTS = [...DEFAULT_PRODUCTS];
    const meta = { source: 'default', updatedAt: null, filename: '' };
    setCatMeta(meta);
    await store.delete('catalogo');
    await store.set('catalogo_meta', meta);
    setCatVersion(v => v + 1);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 text-sm">Carregando...</div>
      </div>
    );
  }

  const finalizarPedido = () => {
    if (!pedidoAtual.clienteId) return alert('Selecione um cliente antes de finalizar.');
    if (pedidoAtual.items.length === 0) return alert('Adicione ao menos um produto.');
    const cliente = clientes.find(c => c.id === pedidoAtual.clienteId);
    const clienteSnapshot = cliente ? { ...cliente } : null;
    const { total } = calcOrder(pedidoAtual.items);
    const novo = { ...pedidoAtual, data: todayISO(), clienteSnapshot, total, finalizadoEm: new Date().toISOString() };
    setPedidos([novo, ...pedidos]);
    exportPedidoStyled(novo, clienteSnapshot, vendedor);
    setPedidoAtual({ id: uid(), numero: '', data: todayISO(), clienteId: null, items: [], obs: '' });
  };

  const apenasExportar = () => {
    if (!pedidoAtual.clienteId) return alert('Selecione um cliente antes de exportar.');
    if (pedidoAtual.items.length === 0) return alert('Adicione ao menos um produto.');
    const cliente = clientes.find(c => c.id === pedidoAtual.clienteId);
    const pedidoComDataAtual = { ...pedidoAtual, data: todayISO() };
    exportPedidoStyled(pedidoComDataAtual, cliente, vendedor);
  };

  const navItems = [
    { id: 'pedido', label: 'Novo Pedido', icon: ShoppingCart },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'catalogo', label: 'Catálogo', icon: Package },
    { id: 'config', label: 'Ajustes', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-stone-50 md:flex">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-200 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: VC_GREEN }}>VC</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">Verde Campo</div>
              <div className="text-xs text-stone-500">Pedidos</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${tab === item.id ? 'text-white' : 'text-stone-600 hover:bg-stone-100'}`}
              style={tab === item.id ? { backgroundColor: VC_GREEN } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: VC_GREEN }}>VC</div>
            <div className="font-semibold text-stone-900 text-sm">{navItems.find(n => n.id === tab)?.label}</div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto">
          {tab === 'pedido' && <NovoPedidoView pedido={pedidoAtual} setPedido={setPedidoAtual} clientes={clientes} onFinalizar={finalizarPedido} onExportar={apenasExportar} catVersion={catVersion} />}
          {tab === 'pedidos' && <PedidosView pedidos={pedidos} setPedidos={setPedidos} vendedor={vendedor} />}
          {tab === 'clientes' && <ClientesView clientes={clientes} setClientes={setClientes} />}
          {tab === 'catalogo' && <CatalogoView catVersion={catVersion} />}
          {tab === 'config' && <ConfigView vendedor={vendedor} setVendedor={setVendedor} setClientes={setClientes} setPedidos={setPedidos} setPedidoAtual={setPedidoAtual} catMeta={catMeta} onUpdateCatalog={updateCatalog} onResetCatalog={resetCatalog} catVersion={catVersion} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-20">
        <div className="flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-1"
              style={tab === item.id ? { color: VC_GREEN } : { color: '#78716c' }}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ============== NOVO PEDIDO ==============
function NovoPedidoView({ pedido, setPedido, clientes, onFinalizar, onExportar, catVersion }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showOnlyOrdered, setShowOnlyOrdered] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addingProduct, setAddingProduct] = useState(null);

  const cliente = clientes.find(c => c.id === pedido.clienteId);
  const { total, totalCaixas } = calcOrder(pedido.items);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return PRODUCTS.filter(p => {
      if (catFilter !== 'all' && p.categoria !== catFilter) return false;
      if (showOnlyOrdered && !pedido.items.find(i => i.codigo === p.codigo)) return false;
      if (!s) return true;
      return p.nome.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s) || (p.sap && p.sap.includes(s)) || p.subcategoria.toLowerCase().includes(s);
    });
  }, [search, catFilter, showOnlyOrdered, pedido.items, catVersion]);

  const addItem = (codigo, caixas, bonif, descPct, isExtra, obs) => {
    const existing = pedido.items.findIndex(i => i.codigo === codigo);
    const newItem = { codigo, caixas, bonif, descPct, isExtra, obs: obs || '' };
    if (existing >= 0) {
      const items = [...pedido.items];
      items[existing] = newItem;
      setPedido({ ...pedido, items });
    } else {
      setPedido({ ...pedido, items: [...pedido.items, newItem] });
    }
    setAddingProduct(null);
  };

  const removeItem = (codigo) => {
    setPedido({ ...pedido, items: pedido.items.filter(i => i.codigo !== codigo) });
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-stone-600 mb-1 block">Cliente</label>
            <select
              value={pedido.clienteId || ''}
              onChange={(e) => setPedido({ ...pedido, clienteId: e.target.value || null })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
            >
              <option value="">Selecionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Nº do Pedido</label>
            <input
              type="text"
              value={pedido.numero}
              onChange={(e) => setPedido({ ...pedido, numero: e.target.value })}
              placeholder="Ex: 39200"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        {clientes.length === 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>Nenhum cliente cadastrado ainda. Vai em <strong>Clientes</strong> e cadastra antes de montar um pedido.</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, código TOTVS, SAP..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setCatFilter('all'); setShowOnlyOrdered(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === 'all' && !showOnlyOrdered ? 'text-white' : 'bg-stone-100 text-stone-700'}`}
            style={catFilter === 'all' && !showOnlyOrdered ? { backgroundColor: VC_GREEN } : {}}
          >
            Todos
          </button>
          {pedido.items.length > 0 && (
            <button
              onClick={() => { setShowOnlyOrdered(!showOnlyOrdered); setCatFilter('all'); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${showOnlyOrdered ? 'text-white' : 'bg-stone-100 text-stone-700'}`}
              style={showOnlyOrdered ? { backgroundColor: VC_GREEN } : {}}
            >
              ✓ No Pedido ({pedido.items.length})
            </button>
          )}
          {CAT_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => { setCatFilter(cat); setShowOnlyOrdered(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === cat ? 'text-white' : 'bg-stone-100 text-stone-700'}`}
              style={catFilter === cat ? { backgroundColor: VC_GREEN } : {}}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-stone-500 bg-white rounded-xl border border-stone-200">
              Nenhum produto encontrado.
            </div>
          )}
          {filtered.map(p => {
            const inCart = pedido.items.find(i => i.codigo === p.codigo);
            const isExtra = inCart?.isExtra;
            return (
              <button
                key={p.codigo}
                onClick={() => setAddingProduct(p)}
                className="w-full bg-white rounded-xl border border-stone-200 p-3 text-left hover:border-stone-300 transition-colors flex items-center gap-3"
              >
                <ProductImage product={p} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-stone-900 text-sm leading-tight">{p.nome}</span>
                    {p.status && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${p.status.toLowerCase().includes('lan') ? 'bg-blue-100 text-blue-700' : 'bg-stone-200 text-stone-600'}`}>
                        {p.status.toLowerCase().includes('lan') ? 'LANÇ.' : 'DESCONT.'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap gap-x-2">
                    <span>{p.codigo}</span>
                    <span>·</span>
                    <span>{p.un_cx} un/cx{p.unidade === 'KG' && p.peso_kg ? ` (${p.peso_kg.toString().replace('.', ',')}kg)` : ''}</span>
                    <span>·</span>
                    <span className="font-medium text-stone-700">{formatBRL(p.preco_st)}{p.unidade === 'KG' ? '/kg' : ''}</span>
                  </div>
                </div>
                {inCart ? (
                  <div className={`text-xs font-medium px-2 py-1 rounded-md ${isExtra ? 'bg-amber-100 text-amber-800' : ''}`} style={!isExtra ? { backgroundColor: VC_GREEN_BG, color: VC_GREEN } : {}}>
                    {inCart.caixas} cx
                  </div>
                ) : (
                  <Plus size={18} className="text-stone-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block">
          <CartPanel pedido={pedido} setPedido={setPedido} cliente={cliente} onRemove={removeItem} onEdit={setAddingProduct} onFinalizar={onFinalizar} onExportar={onExportar} />
        </div>
      </div>

      {pedido.items.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-20 left-4 right-4 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg z-10"
          style={{ backgroundColor: VC_GREEN }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-medium text-sm">{pedido.items.length} item{pedido.items.length > 1 ? 's' : ''} · {totalCaixas} cx</span>
          </div>
          <span className="font-bold">{formatBRL(total)}</span>
        </button>
      )}

      {showCart && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900">Pedido</h3>
              <button onClick={() => setShowCart(false)}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <CartPanel pedido={pedido} setPedido={setPedido} cliente={cliente} onRemove={removeItem} onEdit={(p) => { setShowCart(false); setAddingProduct(p); }} onFinalizar={() => { setShowCart(false); onFinalizar(); }} onExportar={() => { setShowCart(false); onExportar(); }} embedded />
            </div>
          </div>
        </div>
      )}

      {addingProduct && (
        <ProductModal
          product={addingProduct}
          existing={pedido.items.find(i => i.codigo === addingProduct.codigo)}
          onSave={addItem}
          onCancel={() => setAddingProduct(null)}
          onRemove={() => { removeItem(addingProduct.codigo); setAddingProduct(null); }}
        />
      )}
    </div>
  );
}

function CartPanel({ pedido, setPedido, cliente, onRemove, onEdit, onFinalizar, onExportar, embedded }) {
  const { total, totalCaixas, totalBonif } = calcOrder(pedido.items);
  return (
    <div className={`${embedded ? 'p-4' : 'bg-white rounded-xl border border-stone-200 p-4 sticky top-4'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-stone-900 text-sm">Pedido em montagem</h3>
        {pedido.items.length > 0 && (
          <button
            onClick={() => { if (confirm('Limpar o pedido atual?')) setPedido({ ...pedido, items: [] }); }}
            className="text-xs text-stone-500 hover:text-red-600"
          >
            Limpar
          </button>
        )}
      </div>

      {pedido.items.length === 0 ? (
        <div className="text-center py-8 text-xs text-stone-500">
          Selecione produtos para começar.
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {pedido.items.map(item => {
              const p = findProduct(item.codigo);
              if (!p) return null;
              const c = calcItem(item);
              return (
                <div key={item.codigo} className={`rounded-lg p-2 border ${item.isExtra ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex items-start gap-2">
                    <ProductImage product={p} size={36} />
                    <button onClick={() => onEdit(p)} className="text-left flex-1 min-w-0">
                      <div className="font-medium text-xs text-stone-900 leading-tight">{p.nome}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {item.caixas} cx · {c.totalUn} un{item.descPct > 0 ? ` · -${item.descPct}%` : ''}{item.bonif > 0 ? ` · ${item.bonif} bonif` : ''}
                      </div>
                    </button>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-xs text-stone-900">{formatBRL(c.vlTotal)}</div>
                      <button onClick={() => onRemove(item.codigo)} className="text-red-500 hover:text-red-700 mt-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-3 space-y-1 mb-4">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Total caixas</span>
              <span>{totalCaixas}</span>
            </div>
            {totalBonif > 0 && (
              <div className="flex justify-between text-xs text-stone-600">
                <span>Bonificação</span>
                <span>{totalBonif}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-1">
              <span className="text-sm">Total</span>
              <span className="text-base" style={{ color: VC_GREEN }}>{formatBRL(total)}</span>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <label className="text-xs font-medium text-stone-600 block">Observações</label>
            <textarea
              value={pedido.obs}
              onChange={(e) => setPedido({ ...pedido, obs: e.target.value })}
              placeholder="Frete, prazo, observações..."
              rows={2}
              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-2"
            />
          </div>

          <button
            onClick={onFinalizar}
            disabled={!cliente || pedido.items.length === 0}
            className="w-full text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={16} />
            Finalizar e Baixar
          </button>
          <button
            onClick={onExportar}
            disabled={!cliente || pedido.items.length === 0}
            className="w-full mt-2 text-xs text-stone-600 hover:text-stone-900 py-1.5 disabled:opacity-50"
          >
            Baixar sem finalizar
          </button>
        </>
      )}
    </div>
  );
}

function ProductModal({ product, existing, onSave, onCancel, onRemove }) {
  const [caixas, setCaixas] = useState(existing?.caixas || 1);
  const [bonif, setBonif] = useState(existing?.bonif || 0);
  const [descPct, setDescPct] = useState(existing?.descPct || 0);
  const [isExtra, setIsExtra] = useState(existing?.isExtra || false);
  const [obs, setObs] = useState(existing?.obs || '');

  const c = calcItem({ codigo: product.codigo, caixas, bonif, descPct });

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onCancel}>
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-xl p-5 max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <ProductImage product={product} size={64} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm leading-tight">{product.nome}</h3>
            <div className="text-xs text-stone-500 mt-1">
              <div>TOTVS: <span className="font-mono">{product.codigo}</span></div>
              {product.sap && <div>SAP: <span className="font-mono">{product.sap}</span></div>}
              {product.ean && <div>EAN: <span className="font-mono">{product.ean}</span></div>}
              <div className="mt-1">
                {product.unidade === 'KG' && product.peso_kg ? (
                  <>
                    <span className="font-semibold text-amber-700">Vendido por KG</span> · {product.un_cx} un/cx · {product.peso_kg.toString().replace('.', ',')} kg/cx · <span className="font-semibold text-stone-700">{formatBRL(product.preco_st)}/kg</span>
                  </>
                ) : (
                  <>{product.un_cx} un/cx · <span className="font-semibold text-stone-700">{formatBRL(product.preco_st)}</span>/cx</>
                )}
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">Caixas</label>
              <input type="number" min="0" step="1" value={caixas} onChange={(e) => setCaixas(e.target.value)} className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">Bonif.</label>
              <input type="number" min="0" step="1" value={bonif} onChange={(e) => setBonif(e.target.value)} className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">Desc %</label>
              <input type="number" min="0" max="100" step="0.5" value={descPct} onChange={(e) => setDescPct(e.target.value)} className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={isExtra} onChange={(e) => setIsExtra(e.target.checked)} className="rounded" />
            Marcar como sugestão (sai destacado na planilha)
          </label>

          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Observação do item (opcional)</label>
            <input type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: trocar lote, validade preferida..." className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
          </div>

          <div className="rounded-lg p-3" style={{ backgroundColor: VC_GREEN_BG }}>
            {c.isKg ? (
              <>
                <div className="flex justify-between text-xs text-stone-700">
                  <span>Total de unidades</span>
                  <span className="font-semibold">{c.totalUn} un</span>
                </div>
                <div className="flex justify-between text-xs text-stone-700 mt-0.5">
                  <span>Total de peso</span>
                  <span className="font-semibold">{c.totalKg.toFixed(3).replace('.', ',')} kg</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs text-stone-700">
                <span>Total de unidades</span>
                <span className="font-semibold">{c.totalUn}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold mt-1" style={{ color: VC_GREEN }}>
              <span>Vl. Total</span>
              <span>{formatBRL(c.vlTotal)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {existing && (
              <button onClick={onRemove} className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                Remover
              </button>
            )}
            <button onClick={onCancel} className="flex-1 px-3 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">
              Cancelar
            </button>
            <button
              onClick={() => onSave(product.codigo, parseFloat(caixas) || 0, parseFloat(bonif) || 0, parseFloat(descPct) || 0, isExtra, obs)}
              disabled={!caixas || parseFloat(caixas) <= 0}
              className="flex-1 px-3 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: VC_GREEN }}
            >
              {existing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== PEDIDOS (HISTÓRICO) ==============
function PedidosView({ pedidos, setPedidos, vendedor }) {
  const [viewing, setViewing] = useState(null);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-4 hidden md:block">Pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <ClipboardList size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">Nenhum pedido finalizado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pedidos.map(p => (
            <button key={p.id} onClick={() => setViewing(p)} className="w-full bg-white rounded-xl border border-stone-200 p-4 text-left hover:border-stone-300 transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {p.numero && <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}>Nº {p.numero}</span>}
                  <span className="text-xs text-stone-500">{formatDate(p.data)}</span>
                </div>
                <div className="font-medium text-sm text-stone-900 truncate">{p.clienteSnapshot?.razaoSocial || 'Cliente removido'}</div>
                <div className="text-xs text-stone-500 mt-0.5">{p.items.length} produtos</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm" style={{ color: VC_GREEN }}>{formatBRL(p.total)}</div>
                <ChevronRight size={16} className="text-stone-400 ml-auto mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <PedidoDetailModal
          pedido={viewing}
          vendedor={vendedor}
          onClose={() => setViewing(null)}
          onDelete={() => {
            if (confirm('Excluir este pedido do histórico?')) {
              setPedidos(pedidos.filter(p => p.id !== viewing.id));
              setViewing(null);
            }
          }}
        />
      )}
    </div>
  );
}

function PedidoDetailModal({ pedido, vendedor, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900">Pedido {pedido.numero ? `Nº ${pedido.numero}` : ''}</h3>
            <p className="text-xs text-stone-500 mt-0.5">{formatDate(pedido.data)} · {pedido.clienteSnapshot?.razaoSocial}</p>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          <div className="space-y-2 mb-4">
            {pedido.items.map(item => {
              const p = findProduct(item.codigo);
              const c = calcItem(item);
              return (
                <div key={item.codigo} className={`rounded-lg p-2.5 border ${item.isExtra ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs text-stone-900">{p?.nome || item.codigo}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {item.caixas} cx · {c.totalUn} un{item.descPct > 0 ? ` · -${item.descPct}%` : ''}
                      </div>
                    </div>
                    <div className="font-semibold text-xs text-stone-900">{formatBRL(c.vlTotal)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-stone-200 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: VC_GREEN }}>{formatBRL(pedido.total)}</span>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t border-stone-200">
          <button onClick={onDelete} className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
            Excluir
          </button>
          <button
            onClick={() => exportPedidoStyled(pedido, pedido.clienteSnapshot, vendedor)}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={14} />
            Baixar Planilha
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== CLIENTES ==============
function ClientesView({ clientes, setClientes }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-stone-900 hidden md:block">Clientes</h2>
        <button
          onClick={() => setEditing({})}
          className="ml-auto inline-flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg"
          style={{ backgroundColor: VC_GREEN }}
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <Users size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {clientes.map(c => (
            <button key={c.id} onClick={() => setEditing(c)} className="bg-white rounded-xl border border-stone-200 p-3 text-left hover:border-stone-300 transition-colors">
              <div className="font-medium text-stone-900 text-sm truncate">{c.razaoSocial}</div>
              <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                {c.cnpj && <div>CNPJ: {c.cnpj}</div>}
                {c.cidade && <div>{c.cidade}{c.uf ? `/${c.uf}` : ''}</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <ClienteFormModal
          cliente={editing}
          onSave={(c) => {
            if (c.id) {
              setClientes(clientes.map(x => x.id === c.id ? c : x));
            } else {
              setClientes([...clientes, { ...c, id: uid() }]);
            }
            setEditing(null);
          }}
          onDelete={() => {
            if (confirm('Excluir este cliente?')) {
              setClientes(clientes.filter(x => x.id !== editing.id));
              setEditing(null);
            }
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ClienteFormModal({ cliente, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    id: cliente.id,
    razaoSocial: cliente.razaoSocial || '',
    cnpj: cliente.cnpj || '',
    ie: cliente.ie || '',
    telefone: cliente.telefone || '',
    email: cliente.email || '',
    endereco: cliente.endereco || '',
    cidade: cliente.cidade || '',
    uf: cliente.uf || '',
    cep: cliente.cep || '',
    contato: cliente.contato || ''
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onCancel}>
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">{cliente.id ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onCancel}><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-4 flex-1 space-y-3">
          <Field label="Razão Social *" value={form.razaoSocial} onChange={(v) => update('razaoSocial', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CNPJ" value={form.cnpj} onChange={(v) => update('cnpj', v)} placeholder="00.000.000/0000-00" />
            <Field label="IE" value={form.ie} onChange={(v) => update('ie', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone" value={form.telefone} onChange={(v) => update('telefone', v)} />
            <Field label="E-mail" value={form.email} onChange={(v) => update('email', v)} type="email" />
          </div>
          <Field label="Contato (pessoa)" value={form.contato} onChange={(v) => update('contato', v)} placeholder="Nome do comprador" />
          <Field label="Endereço" value={form.endereco} onChange={(v) => update('endereco', v)} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Cidade" value={form.cidade} onChange={(v) => update('cidade', v)} />
            <Field label="UF" value={form.uf} onChange={(v) => update('uf', v.toUpperCase().slice(0, 2))} />
            <Field label="CEP" value={form.cep} onChange={(v) => update('cep', v)} />
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t border-stone-200">
          {cliente.id && (
            <button onClick={onDelete} className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
              Excluir
            </button>
          )}
          <button onClick={onCancel} className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => form.razaoSocial.trim() && onSave(form)}
            disabled={!form.razaoSocial.trim()}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: VC_GREEN }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-600 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
      />
    </div>
  );
}

// ============== CATÁLOGO ==============
function CatalogoView({ catVersion }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return PRODUCTS.filter(p => {
      if (catFilter !== 'all' && p.categoria !== catFilter) return false;
      if (!s) return true;
      return p.nome.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s) || (p.sap && p.sap.includes(s));
    });
  }, [search, catFilter, catVersion]);

  const stats = useMemo(() => {
    const total = PRODUCTS.length;
    const byCat = {};
    PRODUCTS.forEach(p => { byCat[p.categoria] = (byCat[p.categoria] || 0) + 1; });
    return { total, byCat };
  }, [catVersion]);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-1 hidden md:block">Catálogo</h2>
      <p className="text-sm text-stone-500 mb-4 hidden md:block">{stats.total} produtos cadastrados</p>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto, TOTVS, SAP..." className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCatFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === 'all' ? 'text-white' : 'bg-stone-100 text-stone-700'}`} style={catFilter === 'all' ? { backgroundColor: VC_GREEN } : {}}>
            Todos ({stats.total})
          </button>
          {CAT_ORDER.map(cat => stats.byCat[cat] && (
            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === cat ? 'text-white' : 'bg-stone-100 text-stone-700'}`} style={catFilter === cat ? { backgroundColor: VC_GREEN } : {}}>
              {CAT_ICONS[cat]} {cat} ({stats.byCat[cat]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.codigo} className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3">
            <ProductImage product={p} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-stone-900 text-sm">{p.nome}</span>
                {p.status && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${p.status.toLowerCase().includes('lan') ? 'bg-blue-100 text-blue-700' : 'bg-stone-200 text-stone-600'}`}>
                    {p.status.toLowerCase().includes('lan') ? 'LANÇ.' : 'DESCONT.'}
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                TOTVS: {p.codigo}{p.sap ? ` · SAP: ${p.sap}` : ''} · {p.un_cx} un/cx{p.unidade === 'KG' && p.peso_kg ? ` (${p.peso_kg.toString().replace('.', ',')}kg)` : ''}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-sm" style={{ color: VC_GREEN }}>{formatBRL(p.preco_st)}</div>
              {p.unidade === 'KG' && <div className="text-[10px] text-amber-700 font-medium">/kg</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============== CONFIG ==============
function ConfigView({ vendedor, setVendedor, setClientes, setPedidos, setPedidoAtual, catMeta, onUpdateCatalog, onResetCatalog, catVersion }) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-4 hidden md:block">Ajustes</h2>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <h3 className="font-semibold text-stone-900 text-sm mb-3">Dados do Vendedor</h3>
        <p className="text-xs text-stone-500 mb-3">Esses dados aparecem na planilha do pedido. Deixa em branco se não quiser.</p>
        <div className="space-y-3">
          <Field label="Nome" value={vendedor.nome} onChange={(v) => setVendedor({ ...vendedor, nome: v })} placeholder="Ex: Samuel ou nome do seu pai" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone" value={vendedor.telefone} onChange={(v) => setVendedor({ ...vendedor, telefone: v })} />
            <Field label="E-mail" value={vendedor.email} onChange={(v) => setVendedor({ ...vendedor, email: v })} type="email" />
          </div>
        </div>
      </div>

      <CatalogUpdateCard catMeta={catMeta} onUpdate={onUpdateCatalog} onReset={onResetCatalog} catVersion={catVersion} />

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <h3 className="font-semibold text-stone-900 text-sm mb-2">Formato da Planilha</h3>
        <p className="text-xs text-stone-500">
          A planilha é gerada como <code className="bg-stone-100 px-1 rounded">.xls</code> com formatação completa (bordas, cabeçalhos, agrupamento por seção). Excel pode mostrar um aviso ao abrir — é só clicar em "Sim" / "Abrir mesmo assim". Depois de aberto, dá pra salvar como .xlsx normalmente.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-900 text-sm mb-2">Zona de risco</h3>
        <p className="text-xs text-stone-600 mb-3">Apaga dados salvos neste app.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (confirm('Limpar pedido atual? (clientes e histórico ficam)')) {
                setPedidoAtual({ id: uid(), numero: '', data: todayISO(), clienteId: null, items: [], obs: '' });
              }
            }}
            className="text-xs text-stone-700 hover:bg-stone-100 py-1.5 px-2 rounded-lg text-left"
          >
            Limpar apenas o pedido atual
          </button>
          <button
            onClick={() => {
              if (confirm('APAGAR TUDO: clientes, histórico, dados do vendedor e pedido atual. (O catálogo de produtos NÃO é afetado por essa ação.) Continuar?')) {
                setClientes([]);
                setPedidos([]);
                setVendedor({ nome: '', telefone: '', email: '' });
                setPedidoAtual({ id: uid(), numero: '', data: todayISO(), clienteId: null, items: [], obs: '' });
              }
            }}
            className="text-xs text-red-600 hover:bg-red-50 py-1.5 px-2 rounded-lg text-left"
          >
            Apagar todos os dados (clientes, histórico, vendedor)
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogUpdateCard({ catMeta, onUpdate, onReset, catVersion }) {
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

  const stats = useMemo(() => {
    const byCat = {};
    PRODUCTS.forEach(p => { byCat[p.categoria || 'OUTROS'] = (byCat[p.categoria || 'OUTROS'] || 0) + 1; });
    return { total: PRODUCTS.length, byCat };
  }, [catVersion]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow same file to be re-selected later
    if (!file) return;
    setError('');
    setPreview(null);

    if (!file.name.match(/\.xlsx?$/i)) {
      setError('Arquivo precisa ser .xlsx ou .xls');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 10MB).');
      return;
    }

    setParsing(true);
    try {
      const parsed = await parsePriceTable(file);
      const merged = mergeProducts(parsed, PRODUCTS);
      const novos = merged.filter(p => p.status === 'NOVO');
      const removidos = PRODUCTS.filter(c => !merged.find(p => p.codigo === c.codigo));
      const atualizados = merged.filter(p => {
        const old = PRODUCTS.find(c => c.codigo === p.codigo);
        return old && (Math.abs(old.preco_st - p.preco_st) > 0.001 || old.un_cx !== p.un_cx);
      });
      const semAlteracao = merged.length - novos.length - atualizados.length;
      setPreview({
        merged,
        novos,
        removidos,
        atualizados,
        semAlteracao,
        filename: file.name,
      });
    } catch (err) {
      setError(err.message || 'Erro ao processar o arquivo.');
    }
    setParsing(false);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    await onUpdate(preview.merged, preview.filename);
    setPreview(null);
    setError('');
  };

  const handleReset = async () => {
    await onReset();
    setConfirmingReset(false);
    setFeedback('Tabela padrão restaurada.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const formatMetaDate = (iso) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return null; }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
      <h3 className="font-semibold text-stone-900 text-sm mb-2">Catálogo de Produtos</h3>

      {/* Status atual */}
      <div className="text-xs text-stone-600 mb-3 space-y-1">
        <div><strong>{stats.total} produtos</strong> cadastrados</div>
        {catMeta?.source === 'default' ? (
          <div className="text-stone-500">Usando tabela embutida (SPI-T2S4 2026.2 SP)</div>
        ) : (
          <div className="text-stone-500">
            Atualizada em {formatMetaDate(catMeta?.updatedAt) || '—'}
            {catMeta?.filename && <> · {catMeta.filename}</>}
          </div>
        )}
      </div>

      {/* Preview ou botão de upload */}
      {!preview ? (
        <>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="w-full text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: VC_GREEN }}
            >
              {parsing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Lendo arquivo...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Atualizar Tabela (.xlsx)
                </>
              )}
            </button>
            {catMeta?.source === 'upload' && !confirmingReset && (
              <button
                onClick={() => setConfirmingReset(true)}
                className="w-full text-xs text-stone-600 hover:text-stone-900 py-1.5 px-2"
              >
                Restaurar tabela padrão
              </button>
            )}
            {confirmingReset && (
              <div className="flex flex-col gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-xs text-amber-900">
                  <strong>Tem certeza?</strong> A tabela atual será substituída pelos 89 produtos da tabela embutida (com EAN, SAP, peso e imagens originais).
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingReset(false)}
                    className="flex-1 text-xs text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 py-1.5 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 text-xs font-semibold text-white py-1.5 rounded"
                    style={{ backgroundColor: VC_GREEN }}
                  >
                    Sim, restaurar
                  </button>
                </div>
              </div>
            )}
            {feedback && (
              <div className="text-xs py-1 px-2 rounded" style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}>
                ✓ {feedback}
              </div>
            )}
          </div>
          {error && (
            <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 whitespace-pre-line">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-2">
            <FileCheck2 size={14} style={{ color: VC_GREEN }} />
            <span className="font-medium truncate">{preview.filename}</span>
          </div>

          <div className="text-xs space-y-1.5">
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="font-semibold text-stone-900">Total de produtos</span>
              <span className="font-bold" style={{ color: VC_GREEN }}>{preview.merged.length}</span>
            </div>
            {preview.novos.length > 0 && (
              <div className="flex justify-between text-blue-700">
                <span>🆕 Novos produtos</span>
                <span className="font-semibold">+{preview.novos.length}</span>
              </div>
            )}
            {preview.atualizados.length > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>📊 Preço/Un alterado</span>
                <span className="font-semibold">{preview.atualizados.length}</span>
              </div>
            )}
            {preview.semAlteracao > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>✓ Sem alteração</span>
                <span className="font-semibold">{preview.semAlteracao}</span>
              </div>
            )}
            {preview.removidos.length > 0 && (
              <div className="flex justify-between text-red-700">
                <span>❌ Não estão na nova tabela</span>
                <span className="font-semibold">−{preview.removidos.length}</span>
              </div>
            )}
          </div>

          {preview.removidos.length > 0 && (
            <div className="text-[10px] text-stone-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex items-start gap-1">
                <AlertCircle size={11} className="mt-0.5 flex-shrink-0 text-amber-700" />
                <div>
                  <strong>Atenção:</strong> {preview.removidos.length} produto{preview.removidos.length > 1 ? 's' : ''} que existe{preview.removidos.length > 1 ? 'm' : ''} hoje no app não está{preview.removidos.length > 1 ? 'ão' : ''} na nova tabela e ser{preview.removidos.length > 1 ? 'ão removidos' : 'á removido'}. Verifique se está correto.
                </div>
              </div>
            </div>
          )}

          {preview.novos.length > 0 && (
            <details className="text-[10px] text-stone-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
              <summary className="cursor-pointer font-semibold text-blue-700">Ver os {preview.novos.length} produtos novos</summary>
              <ul className="mt-2 space-y-0.5 max-h-32 overflow-y-auto">
                {preview.novos.map(p => (
                  <li key={p.codigo}>· {p.codigo} — {p.nome}</li>
                ))}
              </ul>
              <div className="mt-2 text-blue-800">
                Lançamentos não terão SAP, EAN, peso (queijos) e imagem cadastrados — esses dados podem ser adicionados depois.
              </div>
            </details>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setPreview(null)}
              className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: VC_GREEN }}
            >
              Confirmar atualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
