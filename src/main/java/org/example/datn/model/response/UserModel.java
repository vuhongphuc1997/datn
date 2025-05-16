package org.example.datn.model.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.datn.entity.Profile;
import org.example.datn.model.CommonModel;
import org.example.datn.model.enums.MembershipLevel;
import org.example.datn.model.enums.UserRoles;
import org.example.datn.model.enums.UserStatus;
import org.example.datn.model.enums.UserType;

import java.math.BigDecimal;

/**
 * @author hoangKhong
 */
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserModel extends CommonModel {

    Long id;
    String userName;
    String name;
    UserType type;
    UserStatus status;
    UserRoles role;
    BigDecimal tongChiTieu;
    MembershipLevel capBac;
    boolean verified;

    Long idProfile;
    ProfileModel profile;

}
