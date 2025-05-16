package org.example.datn.model.enums;

public enum SanPhamDoiTraStatus {
    KIEM_TRA(0),
    HOAN_TAC(1),
    HONG(2);
    private final int value;

    SanPhamDoiTraStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
