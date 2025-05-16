package org.example.datn.entity;

import javax.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.datn.model.enums.MembershipLevel;
import org.example.datn.model.enums.UserRoles;
import org.example.datn.model.enums.UserStatus;
import org.example.datn.model.enums.UserType;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * @author hoangKhong
 */
@Entity
@Table(name = "nguoi_dung")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends CommonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "ten_dang_nhap")
    private String userName;

    @Column(name = "mat_khau")
    private String password;


    @Column(name = "loai")
    @Enumerated(EnumType.STRING)
    private UserType type;

    @Column(name = "vaitro")
    @Enumerated(EnumType.STRING)
    private UserRoles role;

    @Column(name = "trang_thai")
    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(name = "xac_thuc")
    private boolean xacThuc;

    @Column(name = "tong_chi_tieu")
    private BigDecimal tongChiTieu;

    @Column(name = "cap_bac")
    @Enumerated(EnumType.STRING)
    private MembershipLevel capBac = MembershipLevel.BAC;
//    @Column(name = "tich_diem")
//    private Integer tichDiem;

    public boolean isNormalType() {
        return Objects.nonNull(type) && type == UserType.NORMAL;
    }

    public void updateMembershipLevel() {
        if (this.tongChiTieu.compareTo(BigDecimal.valueOf(20000000)) >= 0) {
            this.capBac = MembershipLevel.KIM_CUONG;
        } else if (this.tongChiTieu.compareTo(BigDecimal.valueOf(10000000)) >= 0) {
            this.capBac = MembershipLevel.VANG;
        } else {
            this.capBac = MembershipLevel.BAC; // Mặc định là Bạc
        }
    }

}
