package org.example.datn.model.enums;

public enum MembershipLevel {
    BAC("Bạc", "Không có ưu đãi"),
    VANG("Vàng", "Giảm giá 10%, giao hàng miễn phí trên 500,000₫"),
    KIM_CUONG("Kim cương", "Giảm giá 20%, giao hàng miễn phí không giới hạn, hỗ trợ 24/7");

    private final String displayName;
    private final String benefits;

    MembershipLevel(String displayName, String benefits) {
        this.displayName = displayName;
        this.benefits = benefits;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getBenefits() {
        return benefits;
    }
}
