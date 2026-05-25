package iteam.salesapi.dto;

import lombok.Data;

@Data
public class StockDTO {
    private int quantite;
    private Long produitId;
    private Long pointDeVenteId;
}