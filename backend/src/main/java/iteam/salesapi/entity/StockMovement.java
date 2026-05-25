package iteam.salesapi.entity;

import iteam.salesapi.util.StockMovementType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue
    private Long id;

    private int quantite;

    @Enumerated(EnumType.STRING)
    private StockMovementType type;

    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @PrePersist
    public void prePersist() {
        if (date == null) {
            date = LocalDateTime.now();
        }
    }
}
